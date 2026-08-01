import type { NumberLanguageCode } from '@/lib/numbers/registry';

export type PracticeMode = 'listening' | 'speaking';
export type OrderMode = 'sequential' | 'random';
export type LimitType = 'time' | 'questions';

export interface SessionConfig {
  practiceMode: PracticeMode;
  orderMode: OrderMode;
  rangeMin: number;
  rangeMax: number;
  limitType: LimitType;
  limitSeconds: number;
  limitQuestions: number;
  numberLanguage: NumberLanguageCode;
}

export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  practiceMode: 'listening',
  orderMode: 'random',
  rangeMin: 0,
  rangeMax: 20,
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
