'use client';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  name: string;
}

export function Segmented<T extends string>({ options, value, onChange, name }: SegmentedProps<T>) {
  return (
    <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={name}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={`rounded-xl border p-3 text-left transition-colors ${
              selected
                ? 'border-brand-600 bg-brand-50 dark:border-brand-400 dark:bg-brand-950'
                : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600'
            }`}
          >
            <span className="block text-sm font-semibold">{option.label}</span>
            {option.description ? (
              <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{option.description}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
