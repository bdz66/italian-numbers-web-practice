'use client';

import { NumberField } from '@/components/ui/NumberField';
import { useI18n } from '@/lib/i18n/I18nProvider';

interface RangeSelectorProps {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
}

const PRESETS: [number, number][] = [
  [0, 20],
  [0, 100],
  [100, 1000],
  [0, 1000],
];

export function RangeSelector({ min, max, onChange }: RangeSelectorProps) {
  const { t } = useI18n();

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">{t('setup.range')}</h3>
      <div className="grid grid-cols-2 gap-3">
        <NumberField
          id="range-min"
          label={t('setup.range.min')}
          value={min}
          min={0}
          max={999999}
          onChange={(v) => onChange(Number.isFinite(v) ? v : 0, max)}
        />
        <NumberField
          id="range-max"
          label={t('setup.range.max')}
          value={max}
          min={0}
          max={999999}
          onChange={(v) => onChange(min, Number.isFinite(v) ? v : min)}
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {PRESETS.map(([lo, hi]) => (
          <button
            key={`${lo}-${hi}`}
            type="button"
            onClick={() => onChange(lo, hi)}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-brand-400 hover:text-brand-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-brand-500 dark:hover:text-brand-300"
          >
            {lo}–{hi}
          </button>
        ))}
      </div>
    </div>
  );
}
