export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 truncate text-2xl font-bold tabular-nums">{value}</p>
      {hint ? (
        <p className="mt-0.5 break-words text-xs leading-snug text-slate-400 [overflow-wrap:anywhere] dark:text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
