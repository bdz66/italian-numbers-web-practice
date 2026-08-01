'use client';

import { StopButton } from './StopButton';
import { formatClock } from '@/lib/format';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { SessionConfig } from '@/lib/session/types';

interface ProgressHeaderProps {
  config: SessionConfig;
  currentIndex: number;
  elapsedMs: number;
  onStop: () => void;
}

export function ProgressHeader({ config, currentIndex, elapsedMs, onStop }: ProgressHeaderProps) {
  const { t } = useI18n();
  const current = currentIndex + 1;

  const progressLabel =
    config.limitType === 'questions'
      ? t('practice.questionOf', { current, total: config.limitQuestions })
      : t('practice.questionCount', { current });

  const timeLabel =
    config.limitType === 'time'
      ? t('practice.timeRemaining', { time: formatClock(Math.max(0, config.limitSeconds * 1000 - elapsedMs)) })
      : t('practice.elapsed', { time: formatClock(elapsedMs) });

  const progressPct =
    config.limitType === 'questions'
      ? Math.min(100, (currentIndex / config.limitQuestions) * 100)
      : Math.min(100, (elapsedMs / (config.limitSeconds * 1000)) * 100);

  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
        <span className="font-medium">{progressLabel}</span>
        <span>{timeLabel}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progressPct}%` }} />
      </div>
      <div className="flex justify-end">
        <StopButton onStop={onStop} />
      </div>
    </div>
  );
}
