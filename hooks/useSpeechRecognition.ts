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

export function useSpeechRecognition(options: UseSpeechRecognitionOptions): UseSpeechRecognitionResult {
  const supported = isSTTSupported();
  const [status, setStatus] = useState<RecognitionStatus>('idle');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const recognizerRef = useRef<Recognizer | undefined>(undefined);
  const onFinalResultRef = useRef(options.onFinalResult);
  useEffect(() => {
    onFinalResultRef.current = options.onFinalResult;
  });

  const stop = useCallback(() => {
    recognizerRef.current?.stop();
  }, []);

  useEffect(() => () => recognizerRef.current?.abort(), []);

  const start = useCallback(() => {
    if (!supported) {
      setStatus('error');
      setErrorMessage('Speech recognition is not supported in this browser.');
      return;
    }

    setInterimTranscript('');
    setErrorMessage(undefined);

    const recognizer = createRecognizer({
      lang: options.lang,
      interimResults: true,
      maxAlternatives: 3,
      onStart: () => setStatus('listening'),
      onResult: ({ transcripts, isFinal }) => {
        setInterimTranscript(transcripts[0] ?? '');
        if (isFinal) {
          onFinalResultRef.current?.(transcripts.filter(Boolean));
        }
      },
      onError: (error) => {
        if (error === 'no-speech') {
          setStatus('no-speech');
        } else {
          setStatus('error');
          setErrorMessage(error);
        }
      },
      onEnd: () => {
        setStatus((current) => (current === 'listening' ? 'idle' : current));
      },
    });

    recognizerRef.current = recognizer;
    recognizer?.start();
  }, [supported, options.lang]);

  return { supported, status, interimTranscript, errorMessage, start, stop };
}
