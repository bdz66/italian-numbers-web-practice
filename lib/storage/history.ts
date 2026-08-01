import type { SessionConfig } from '@/lib/session/types';
import { readLocalStorage, STORAGE_KEYS, writeLocalStorage } from './localStorage';

export interface HistoryEntry {
  id: string;
  completedAt: number;
  config: SessionConfig;
  totalQuestions: number;
  correctCount: number;
  accuracyPct: number;
  totalTimeMs: number;
}

const MAX_HISTORY_ENTRIES = 20;

export function loadHistory(): HistoryEntry[] {
  return readLocalStorage<HistoryEntry[]>(STORAGE_KEYS.history, []);
}

export function appendHistoryEntry(entry: HistoryEntry): HistoryEntry[] {
  const updated = [entry, ...loadHistory()].slice(0, MAX_HISTORY_ENTRIES);
  writeLocalStorage(STORAGE_KEYS.history, updated);
  return updated;
}

export function clearHistory(): HistoryEntry[] {
  writeLocalStorage<HistoryEntry[]>(STORAGE_KEYS.history, []);
  return [];
}
