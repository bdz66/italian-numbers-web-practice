'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatClock, formatSeconds } from '@/lib/format';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { getNumberLanguage } from '@/lib/numbers/registry';
import { computeResults, type NumberStat } from '@/lib/session/stats';
import type { SessionResult } from '@/lib/session/types';
import { NumberBreakdownTable } from './NumberBreakdownTable';
import { StatCard } from './StatCard';

interface ResultsSummaryProps {
  session: SessionResult;
  onNewSession: () => void;
}

export function ResultsSummary({ session, onNewSession }: ResultsSummaryProps) {
  const { t } = useI18n();
  const stats = useMemo(() => computeResults(session), [session]);
  const language = getNumberLanguage(session.config.numberLanguage);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('results.title')}</h1>
        <Button onClick={onNewSession}>{t('results.newSession')}</Button>
      </div>

      {stats.totalQuestions === 0 ? (
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('results.noAnswers')}</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label={t('results.correctCount')} value={String(stats.correctCount)} />
            <StatCard label={t('results.incorrectCount')} value={String(stats.incorrectCount)} />
            <StatCard label={t('results.accuracy')} value={`${Math.round(stats.accuracyPct)}%`} />
            <StatCard label={t('results.totalTime')} value={formatClock(stats.totalTimeMs)} />
            <StatCard label={t('results.avgTime')} value={formatSeconds(stats.avgTimeMsPerQuestion)} />
            <StatCard
              label={t('results.fastest')}
              value={stats.fastest ? formatSeconds(stats.fastest.timeMs) : '—'}
              hint={stats.fastest ? numberWithWords(stats.fastest.number, language.toWords) : undefined}
            />
            <StatCard
              label={t('results.slowest')}
              value={stats.slowest ? formatSeconds(stats.slowest.timeMs) : '—'}
              hint={stats.slowest ? numberWithWords(stats.slowest.number, language.toWords) : undefined}
            />
          </div>

          <Card className="space-y-4">
            <NumberList
              title={t('results.mostDifficult')}
              stats={stats.mostDifficult}
              toWords={language.toWords}
              emptyLabel="—"
              tone="rose"
            />
            <NumberList
              title={t('results.easiest')}
              stats={stats.easiest}
              toWords={language.toWords}
              emptyLabel="—"
              tone="emerald"
            />
          </Card>

          <Card className="space-y-3">
            <NumberChipsRow title={t('results.correctNumbers')} numbers={stats.correctNumbers} tone="emerald" />
            <NumberChipsRow title={t('results.incorrectNumbers')} numbers={stats.incorrectNumbers} tone="rose" />
          </Card>

          <Card>
            <h2 className="mb-3 text-sm font-semibold">{t('results.breakdown')}</h2>
            <NumberBreakdownTable stats={stats.perNumberStats} />
          </Card>
        </>
      )}
    </div>
  );
}

function numberWithWords(n: number, toWords: (n: number) => string): string {
  return `${n} · ${toWords(n)}`;
}

function NumberList({
  title,
  stats,
  toWords,
  emptyLabel,
  tone,
}: {
  title: string;
  stats: NumberStat[];
  toWords: (n: number) => string;
  emptyLabel: string;
  tone: 'rose' | 'emerald';
}) {
  const toneClass =
    tone === 'rose'
      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      {stats.length === 0 ? (
        <p className="text-xs text-slate-400">{emptyLabel}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {stats.map((s) => (
            <span key={s.number} className={`rounded-full px-3 py-1 text-xs font-medium ${toneClass}`}>
              {s.number} · {toWords(s.number)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function NumberChipsRow({
  title,
  numbers,
  tone,
}: {
  title: string;
  numbers: number[];
  tone: 'rose' | 'emerald';
}) {
  const toneClass =
    tone === 'rose'
      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      {numbers.length === 0 ? (
        <p className="text-xs text-slate-400">—</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {numbers.map((n) => (
            <span key={n} className={`rounded-full px-2.5 py-0.5 text-xs font-medium tabular-nums ${toneClass}`}>
              {n}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
