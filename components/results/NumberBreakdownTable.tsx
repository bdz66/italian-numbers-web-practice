import { formatSeconds } from '@/lib/format';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { NumberStat } from '@/lib/session/stats';

export function NumberBreakdownTable({ stats }: { stats: NumberStat[] }) {
  const { t } = useI18n();

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[24rem] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
            <th className="py-2 pr-3">{t('results.breakdown.number')}</th>
            <th className="py-2 pr-3">{t('results.breakdown.attempts')}</th>
            <th className="py-2 pr-3">{t('results.breakdown.correct')}</th>
            <th className="py-2">{t('results.breakdown.avgTime')}</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((s) => (
            <tr key={s.number} className="border-b border-slate-100 last:border-0 dark:border-slate-900">
              <td className="py-1.5 pr-3 font-medium tabular-nums">{s.number}</td>
              <td className="py-1.5 pr-3 tabular-nums">{s.attempts}</td>
              <td className="py-1.5 pr-3 tabular-nums">
                {s.correctCount}/{s.attempts}
              </td>
              <td className="py-1.5 tabular-nums">{formatSeconds(s.avgTimeMs)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
