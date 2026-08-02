'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createRecognizer, type Recognizer } from '@/lib/speech/stt';
import { isSTTSupported } from '@/lib/speech/support';

export type RecognitionStatus = 'idle' | 'listening' | 'no-speech' | 'error';

export interface UseSpeechRecognitionOptions {
  lang: string;
  /**
   * Keeps the microphone open across multiple recognized phrases instead of stopping
   * after the first one — a whole multi-answer session runs off a single `start()`
   * call, with `onFinalResult` firing once per phrase. If the underlying browser session
   * unexpectedly drops (a real-world quirk, especially in Safari, even with `continuous`
   * requested), it's transparently restarted so the caller never has to re-arm the mic.
   */
  continuous?: boolean;
  /** Called once per recognized phrase (fires repeatedly over one session when `continuous`). */
  onFinalResult?: (transcripts: string[]) => void;
}

export interface UseSpeechRecognitionResult {
  supported: boolean;
  status: RecognitionStatus;
  interimTranscript: string;
  errorMessage: string | undefined;
  start: () => void;
  stop: () => void;
}

/**
 * Some browsers can stream interim results for a phrase and then never mark one
 * `isFinal`. Rather than depend on the browser to ever say it's done, once a non-empty
 * interim transcript has sat unclaimed this long, it's treated as the answer.
 */
const FALLBACK_FINALIZE_MS = 2200;

/** Errors that mean the mic is genuinely unusable — don't keep auto-restarting into these. */
const FATAL_ERRORS = new Set(['not-allowed', 'audio-capture', 'service-not-allowed']);

export function useSpeechRecognition(options: UseSpeechRecognitionOptions): UseSpeechRecognitionResult {
  const supported = isSTTSupported();
  const [status, setStatus] = useState<RecognitionStatus>('idle');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const recognizerRef = useRef<Recognizer | undefined>(undefined);
  const fallbackTimeoutRef = useRef<number | undefined>(undefined);
  const latestTranscriptsRef = useRef<string[]>([]);
  const phraseFinalizedRef = useRef(false);
  const intentionalStopRef = useRef(true);
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });
  // Indirection so the `onEnd` handler can trigger a restart without `beginListening`
  // referencing its own `useCallback` binding directly.
  const beginListeningRef = useRef<() => void>(() => undefined);

  const clearFallbackTimeout = useCallback(() => {
    if (fallbackTimeoutRef.current !== undefined) {
      window.clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = undefined;
    }
  }, []);

  const finalizePhrase = useCallback(
    (transcripts: string[]) => {
      if (phraseFinalizedRef.current) return;
      phraseFinalizedRef.current = true;
      clearFallbackTimeout();
      if (!optionsRef.current.continuous) recognizerRef.current?.stop();
      optionsRef.current.onFinalResult?.(transcripts.filter(Boolean));

      if (optionsRef.current.continuous) {
        // Ready to track the next phrase within the same ongoing session.
        latestTranscriptsRef.current = [];
        phraseFinalizedRef.current = false;
        setInterimTranscript('');
      }
    },
    [clearFallbackTimeout],
  );

  const beginListening = useCallback(() => {
    latestTranscriptsRef.current = [];
    phraseFinalizedRef.current = false;
    setInterimTranscript('');

    const recognizer = createRecognizer({
      lang: optionsRef.current.lang,
      interimResults: true,
      maxAlternatives: 3,
      continuous: optionsRef.current.continuous,
      onStart: () => setStatus('listening'),
      onResult: ({ transcripts, isFinal }) => {
        setInterimTranscript(transcripts[0] ?? '');
        latestTranscriptsRef.current = transcripts;

        if (isFinal) {
          finalizePhrase(transcripts);
          return;
        }

        if (fallbackTimeoutRef.current === undefined && transcripts.some((t) => t.trim().length > 0)) {
          fallbackTimeoutRef.current = window.setTimeout(() => {
            fallbackTimeoutRef.current = undefined;
            finalizePhrase(latestTranscriptsRef.current);
          }, FALLBACK_FINALIZE_MS);
        }
      },
      onError: (error) => {
        clearFallbackTimeout();
        if (FATAL_ERRORS.has(error)) {
          intentionalStopRef.current = true;
          setStatus('error');
          setErrorMessage(error);
          return;
        }
        if (optionsRef.current.continuous && !intentionalStopRef.current) {
          // Transient (e.g. a silent gap between numbers) — onEnd, which reliably
          // follows, restarts the session. Don't flicker status for this.
          return;
        }
        if (error === 'no-speech') {
          setStatus('no-speech');
        } else {
          setStatus('error');
          setErrorMessage(error);
        }
      },
      onEnd: () => {
        clearFallbackTimeout();
        if (intentionalStopRef.current || !optionsRef.current.continuous) {
          setStatus((current) => (current === 'listening' ? 'idle' : current));
          return;
        }
        // The browser session dropped on its own (a known real-world quirk, even with
        // `continuous` requested) — resume transparently instead of leaving a dead mic.
        beginListeningRef.current();
      },
    });

    recognizerRef.current = recognizer;
    recognizer?.start();
  }, [clearFallbackTimeout, finalizePhrase]);

  useEffect(() => {
    beginListeningRef.current = beginListening;
  });

  const start = useCallback(() => {
    if (!supported) {
      setStatus('error');
      setErrorMessage('Speech recognition is not supported in this browser.');
      return;
    }
    setErrorMessage(undefined);
    intentionalStopRef.current = false;
    beginListening();
  }, [supported, beginListening]);

  const stop = useCallback(() => {
    intentionalStopRef.current = true;
    clearFallbackTimeout();
    recognizerRef.current?.stop();
  }, [clearFallbackTimeout]);

  useEffect(
    () => () => {
      intentionalStopRef.current = true;
      clearFallbackTimeout();
      recognizerRef.current?.abort();
    },
    [clearFallbackTimeout],
  );

  return { supported, status, interimTranscript, errorMessage, start, stop };
}
