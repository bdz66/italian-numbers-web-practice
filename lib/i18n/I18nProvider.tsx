'use client';

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { STORAGE_KEYS } from '@/lib/storage/localStorage';
import { DEFAULT_UI_LANGUAGE, translate, type UILanguage } from './dictionary';

interface I18nContextValue {
  lang: UILanguage;
  setLang: (lang: UILanguage) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useLocalStorage<UILanguage>(STORAGE_KEYS.uiLanguage, DEFAULT_UI_LANGUAGE);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang],
  );

  const value = useMemo<I18nContextValue>(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within an I18nProvider');
  return ctx;
}
