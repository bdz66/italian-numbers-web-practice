import { getSpeechRecognitionCtor } from './support';

export interface RecognitionResultPayload {
  /** All alternative transcripts for the current (possibly interim) result. */
  transcripts: string[];
  isFinal: boolean;
}

export interface RecognizerOptions {
  lang: string;
  interimResults?: boolean;
  maxAlternatives?: number;
  onResult?: (payload: RecognitionResultPayload) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export interface Recognizer {
  start: () => void;
  stop: () => void;
  abort: () => void;
}

/** Wraps `SpeechRecognition`/`webkitSpeechRecognition` behind a small, browser-agnostic API. */
export function createRecognizer(options: RecognizerOptions): Recognizer | undefined {
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor) {
    options.onError?.('not-supported');
    return undefined;
  }

  const recognition = new Ctor();
  recognition.lang = options.lang;
  recognition.interimResults = options.interimResults ?? true;
  recognition.maxAlternatives = options.maxAlternatives ?? 3;
  recognition.continuous = false;

  recognition.onstart = () => options.onStart?.();
  recognition.onend = () => options.onEnd?.();
  recognition.onerror = (event) => options.onError?.(event.error);

  recognition.onresult = (event) => {
    const lastIndex = event.results.length - 1;
    const result = event.results[lastIndex];
    if (!result) return;

    const transcripts: string[] = [];
    for (let i = 0; i < result.length; i++) {
      transcripts.push(result[i]?.transcript ?? '');
    }

    options.onResult?.({ transcripts, isFinal: result.isFinal });
  };

  return {
    start: () => recognition.start(),
    stop: () => recognition.stop(),
    abort: () => recognition.abort(),
  };
}
