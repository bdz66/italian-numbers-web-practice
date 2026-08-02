'use client';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Visible label rendered next to the switch. Omit when a label is already shown elsewhere — pass `ariaLabel` instead. */
  label?: string;
  ariaLabel?: string;
  id?: string;
}

export function Switch({ checked, onChange, label, ariaLabel, id }: SwitchProps) {
  return (
    <label htmlFor={id} className="inline-flex cursor-pointer select-none items-center gap-2">
      {label ? <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span> : null}
      <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-label={label ? undefined : ariaLabel}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full bg-slate-300 transition-colors peer-checked:bg-brand-600 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-600 dark:bg-slate-600" />
        <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
