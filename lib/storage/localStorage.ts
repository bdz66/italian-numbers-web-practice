export const STORAGE_KEYS = {
  settings: 'inp:settings:v1',
  uiLanguage: 'inp:ui-language:v1',
  history: 'inp:history:v1',
  showWrittenForm: 'inp:show-written-form:v1',
} as const;

/** Imperative (non-hook) read, for use outside React state — e.g. appending history after a session ends. */
export function readLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable (e.g. private browsing) — fail silently, nothing to recover
  }
}
