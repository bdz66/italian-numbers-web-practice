'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createRecognizer, type Recognizer } from '@/lib/speech/stt';
import { isSTTSupported } from '@/lib/speech/support';

export type RecognitionStatus = 'idle' | 'listening' | 'no-speech' | 'error';

export interface UseSpeechRecognitionOptions {
  lang: string;
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
 * Some browsers (Safari in particular) can stream interim results for an utterance and
 * then never mark one `isFinal`, and never even fire `onend` — leaving the recognizer
 * "listening" forever with nothing to evaluate. Rather than depend on the browser to
 * ever tell us it's done, we finalize ourselves: once a non-empty interim transcript
 * has been sitting unclaimed for this long, treat it as the answer.
 */
const FALLBACK_FINALIZE_MS = 2200;
/** Absolute backstop in case even the interim transcript never arrives (near-silence). */
const MAX_LISTEN_MS = 8000;

export function useSpeechRecognition(options: UseSpeechRecognitionOptions): UseSpeechRecognitionResult {
  const supported = isSTTSupported();
  const [status, setStatus] = useState<RecognitionStatus>('idle');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const recognizerRef = useRef<Recognizer | undefined>(undefined);
  const safetyTimeoutRef = useRef<number | undefined>(undefined);
  const fallbackTimeoutRef = useRef<number | undefined>(undefined);
  const latestTranscriptsRef = useRef<string[]>([]);
  const finalizedRef = useRef(false);
  const onFinalResultRef = useRef(options.onFinalResult);
  useEffect(() => {
    onFinalResultRef.current = options.onFinalResult;
  });

  const clearTimeouts = useCallback(() => {
    if (safetyTimeoutRef.current !== undefined) {
      window.clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = undefined;
    }
    if (fallbackTimeoutRef.current !== undefined) {
      window.clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = undefined;
    }
  }, []);

  const finalize = useCallback(
    (transcripts: string[]) => {
      if (finalizedRef.current) return;
      finalizedRef.current = true;
      clearTimeouts();
      setStatus((current) => (current === 'listening' ? 'idle' : current));
      recognizerRef.current?.stop();
      onFinalResultRef.current?.(transcripts.filter(Boolean));
    },
    [clearTimeouts],
  );

  const stop = useCallback(() => {
    recognizerRef.current?.stop();
  }, []);

  useEffect(
    () => () => {
      clearTimeouts();
      recognizerRef.current?.abort();
    },
    [clearTimeouts],
  );

  const start = useCallback(() => {
    if (!supported) {
      setStatus('error');
      setErrorMessage('Speech recognition is not supported in this browser.');
      return;
    }

    setInterimTranscript('');
    setErrorMessage(undefined);
    latestTranscriptsRef.current = [];
    finalizedRef.current = false;

    const recognizer = createRecognizer({
      lang: options.lang,
      interimResults: true,
      maxAlternatives: 3,
      onStart: () => setStatus('listening'),
      onResult: ({ transcripts, isFinal }) => {
        setInterimTranscript(transcripts[0] ?? '');
        latestTranscriptsRef.current = transcripts;

        if (isFinal) {
          finalize(transcripts);
          return;
        }

        if (fallbackTimeoutRef.current === undefined && transcripts.some((t) => t.trim().length > 0)) {
          fallbackTimeoutRef.current = window.setTimeout(() => {
            fallbackTimeoutRef.current = undefined;
            finalize(latestTranscriptsRef.current);
          }, FALLBACK_FINALIZE_MS);
        }
      },
      onError: (error) => {
        clearTimeouts();
        if (finalizedRef.current) return;
        if (error === 'no-speech') {
          setStatus('no-speech');
        } else {
          setStatus('error');
          setErrorMessage(error);
        }
      },
      onEnd: () => {
        clearTimeouts();
        if (finalizedRef.current) return;
        setStatus((current) => (current === 'listening' ? 'idle' : current));
      },
    });

    recognizerRef.current = recognizer;
    recognizer?.start();

    if (recognizer) {
      safetyTimeoutRef.current = window.setTimeout(() => {
        safetyTimeoutRef.current = undefined;
        if (latestTranscriptsRef.current.some((t) => t.trim().length > 0)) {
          finalize(latestTranscriptsRef.current);
        } else {
          recognizer.stop();
        }
      }, MAX_LISTEN_MS);
    }
  }, [supported, options.lang, finalize, clearTimeouts]);

  return { supported, status, interimTranscript, errorMessage, start, stop };
}
