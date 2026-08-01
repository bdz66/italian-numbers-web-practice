export type NumberLanguageCode = 'it';

export interface NumberLanguage {
  code: NumberLanguageCode;
  /** BCP-47 tag used for speechSynthesis / SpeechRecognition. */
  speechLang: string;
  /** Human readable label, in its own language. */
  label: string;
  /** Convert an integer into its spoken-word form, e.g. 42 -> "quarantadue". */
  toWords: (n: number) => string;
  /** Normalize arbitrary recognized/typed text for comparison (lowercase, strip accents/punctuation/spaces). */
  normalize: (text: string) => string;
  /**
   * Decide whether a raw STT transcript (or list of alternatives) matches the expected number.
   * Returns the best match method found, or 'none'.
   */
  compareSpokenToNumber: (transcripts: string[], correct: number) => SpokenMatchResult;
}

export type SpokenMatchMethod = 'digits' | 'exact-words' | 'fuzzy-words' | 'none';

export interface SpokenMatchResult {
  isMatch: boolean;
  method: SpokenMatchMethod;
  /** The transcript (from the candidates) that produced the match, if any. */
  matchedTranscript?: string;
}
