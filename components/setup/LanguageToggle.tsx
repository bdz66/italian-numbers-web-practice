'use client';

import { useI18n } from '@/lib/i18n/I18nProvider';
import { UI_LANGUAGE_LABELS, type UILanguage } from '@/lib/i18n/dictionary';

const LANGUAGES: UILanguage[] = ['en', 'it'];

export function LanguageToggle() {
  const { lang, setLang, t } = useI18n();

  return (
    <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
      <span className="sr-only">{t('setup.uiLanguage')}</span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as UILanguage)}
        className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        aria-label={t('setup.uiLanguage')}
      >
        {LANGUAGES.map((code) => (
          <option key={code} value={code}>
            {UI_LANGUAGE_LABELS[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
