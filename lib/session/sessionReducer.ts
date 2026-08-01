import { DEFAULT_SESSION_CONFIG, type QuestionResult, type SessionConfig } from './types';

export type SessionPhase = 'setup' | 'running' | 'finished';

export interface SessionState {
  phase: SessionPhase;
  config: SessionConfig;
  currentNumber: number;
  currentIndex: number;
  answers: QuestionResult[];
  startedAt: number;
  endedAt: number | null;
}

export const initialSessionState: SessionState = {
  phase: 'setup',
  config: DEFAULT_SESSION_CONFIG,
  currentNumber: 0,
  currentIndex: 0,
  answers: [],
  startedAt: 0,
  endedAt: null,
};

export type SessionAction =
  | { type: 'START'; config: SessionConfig; firstNumber: number; now: number }
  | { type: 'ANSWERED'; result: QuestionResult }
  | { type: 'ADVANCE'; nextNumber: number }
  | { type: 'FINISH'; now: number }
  | { type: 'RESTART' };

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'START':
      return {
        phase: 'running',
        config: action.config,
        currentNumber: action.firstNumber,
        currentIndex: 0,
        answers: [],
        startedAt: action.now,
        endedAt: null,
      };
    case 'ANSWERED':
      return { ...state, answers: [...state.answers, action.result] };
    case 'ADVANCE':
      return { ...state, currentNumber: action.nextNumber, currentIndex: state.currentIndex + 1 };
    case 'FINISH':
      if (state.phase === 'finished') return state;
      return { ...state, phase: 'finished', endedAt: action.now };
    case 'RESTART':
      return { ...initialSessionState, config: state.config };
    default:
      return state;
  }
}
