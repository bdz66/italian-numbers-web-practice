import type { NumberLanguageCode } from '@/lib/numbers/registry';

export type PracticeMode = 'listening' | 'speaking';
export type OrderMode = 'sequential' | 'random';
export type LimitType = 'time' | 'questions';
/** Where the pool of practiced numbers comes from. 'custom' is only offered for random order. */
export type NumberSource = 'range' | 'custom';

export interface SessionConfig {
  practiceMode: PracticeMode;
  orderMode: OrderMode;
  numberSource: NumberSource;
  rangeMin: number;
  rangeMax: number;
  /** Raw text for the 'custom' number source, e.g. "1 23 543 23 534 51" or "1, 23, 53". */
  customNumbersRaw: string;
  limitType: LimitType;
  limitSeconds: number;
  limitQuestions: number;
  numberLanguage: NumberLanguageCode;
}

export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  practiceMode: 'listening',
  orderMode: 'random',
  numberSource: 'range',
  rangeMin: 0,
  rangeMax: 20,
  customNumbersRaw: '',
  limitType: 'questions',
  limitSeconds: 120,
  limitQuestions: 15,
  numberLanguage: 'it',
};

export type SpokenMatchMethodOrTyped = 'typed' | 'digits' | 'exact-words' | 'fuzzy-words' | 'none';

export interface QuestionResult {
  number: number;
  userAnswer: string;
  correct: boolean;
  timeMs: number;
  matchMethod: SpokenMatchMethodOrTyped;
}

export interface SessionResult {
  config: SessionConfig;
  startedAt: number;
  endedAt: number;
  answers: QuestionResult[];
}
