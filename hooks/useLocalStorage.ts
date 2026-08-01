'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Syncs state to `localStorage`. Starts from `defaultValue` on the server/first client
 * render (so SSR markup matches), then hydrates from storage in an effect.
 *
 * If the stored value and `defaultValue` are both plain objects, they're shallow-merged
 * (stored values win) so a value persisted by an older version of the app — missing
 * fields a later version added — still ends up with every field defined, instead of
 * `undefined` fields crashing code that assumes the current shape.
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(defaultValue);
  const [hydrated, setHydrated] = useState(false);
  const defaultValueRef = useRef(defaultValue);
  useEffect(() => {
    defaultValueRef.current = defaultValue;
  });

  useEffect(() => {
    // Synchronizing with an external system (localStorage) that isn't available during
    // SSR — this can't be a lazy useState initializer without causing a hydration mismatch.
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        const parsed = JSON.parse(raw) as T;
        const merged =
          isPlainObject(parsed) && isPlainObject(defaultValueRef.current)
            ? ({ ...defaultValueRef.current, ...parsed } as T)
            : parsed;
        setValue(merged);
      }
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
