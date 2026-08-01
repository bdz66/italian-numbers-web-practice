'use client';

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  id?: string;
}

export function NumberField({ label, value, onChange, min, max, id }: NumberFieldProps) {
  const fieldId = id ?? label.replace(/\s+/g, '-').toLowerCase();
  return (
    <label htmlFor={fieldId} className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
      <input
        id={fieldId}
        type="number"
        inputMode="numeric"
        value={Number.isNaN(value) ? '' : value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.valueAsNumber)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />
    </label>
  );
}
