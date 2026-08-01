'use client';

import { useI18n } from '@/lib/i18n/I18nProvider';
import { parseCustomNumberList } from '@/lib/session/generateQuestions';

interface CustomNumberListInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function CustomNumberListInput({ value, onChange }: CustomNumberListInputProps) {
  const { t } = useI18n();
  const parsedCount = parseCustomNumberList(value).length;

  return (
    <div>
      <label htmlFor="custom-numbers" className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
        {t('setup.customNumbers')}
      </label>
      <textarea
        id="custom-numbers"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('setup.customNumbers.placeholder')}
        rows={3}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />
      <p
        className={`mt-1 text-xs ${
          parsedCount === 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500'
        }`}
      >
        {parsedCount === 0
          ? t('setup.customNumbers.empty')
          : t('setup.customNumbers.count', { count: parsedCount })}
      </p>
    </div>
  );
}
