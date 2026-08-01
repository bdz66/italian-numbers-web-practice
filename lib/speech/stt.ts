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
    // A single "turn" can produce more than one result entry (e.g. a false-start filler
    // word finalizes as its own entry before the actual answer starts accumulating in the
    // next one). Scanning only the last entry can permanently miss an earlier one that
    // already finalized, leaving the app "stuck" listening while later entries keep
    // getting revised. Prefer the first final entry among the newly-changed ones; only
    // fall back to the latest (still-interim) entry for live display.
    let finalResult: SpeechRecognitionResult | undefined;
    let latestResult: SpeechRecognitionResult | undefined;

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (!result) continue;
      latestResult = result;
      if (result.isFinal && !finalResult) finalResult = result;
    }

    const reported = finalResult ?? latestResult;
    if (!reported) return;

    const transcripts: string[] = [];
    for (let i = 0; i < reported.length; i++) {
      transcripts.push(reported[i]?.transcript ?? '');
    }

    options.onResult?.({ transcripts, isFinal: reported.isFinal });

    // Once we have a final phrase, stop listening rather than let the browser keep
    // capturing (and potentially appending) further speech we don't need.
    if (reported.isFinal) recognition.stop();
  };

  return {
    start: () => recognition.start(),
    stop: () => recognition.stop(),
    abort: () => recognition.abort(),
  };
}
