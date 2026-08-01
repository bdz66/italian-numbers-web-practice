'use client';

import { Button } from '@/components/ui/Button';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { HistoryEntry } from '@/lib/storage/history';

interface RecentSessionsProps {
  entries: HistoryEntry[];
  onClear: () => void;
}

export function RecentSessions({ entries, onClear }: RecentSessionsProps) {
  const { t } = useI18n();

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{t('setup.recentSessions')}</h3>
        {entries.length > 0 ? (
          <Button variant="ghost" size="md" className="px-2 py-1 text-xs" onClick={onClear}>
            {t('setup.recentSessions.clear')}
          </Button>
        ) : null}
      </div>

      {entries.length === 0 ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">{t('setup.recentSessions.empty')}</p>
      ) : (
        <ul className="space-y-1.5">
          {entries.slice(0, 6).map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-800"
            >
              <span className="text-slate-500 dark:text-slate-400">
                {new Date(entry.completedAt).toLocaleDateString()} · {entry.config.practiceMode} ·{' '}
                {entry.config.rangeMin}–{entry.config.rangeMax}
              </span>
              <span className="font-medium">
                {t('setup.recentSessions.summary', {
                  correct: entry.correctCount,
                  total: entry.totalQuestions,
                  accuracy: Math.round(entry.accuracyPct),
                })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
