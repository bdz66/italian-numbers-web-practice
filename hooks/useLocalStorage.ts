'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Syncs state to `localStorage`. Starts from `defaultValue` on the server/first client
 * render (so SSR markup matches), then hydrates from storage in an effect.
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(defaultValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Synchronizing with an external system (localStorage) that isn't available during
    // SSR — this can't be a lazy useState initializer without causing a hydration mismatch.
    try {
      const raw = window.localStorage.getItem(key);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      // ignore malformed/inaccessible storage
    } finally {
      setHydrated(true);
    }
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage full/unavailable (e.g. private browsing) — fail silently
    }
  }, [key, value, hydrated]);

  const set = useCallback((next: T | ((prev: T) => T)) => {
    setValue(next);
  }, []);

  return [value, set];
}
