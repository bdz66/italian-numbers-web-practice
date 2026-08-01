'use client';

import { NumberField } from '@/components/ui/NumberField';
import { Segmented } from '@/components/ui/Segmented';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { LimitType } from '@/lib/session/types';

interface LimitSelectorProps {
  limitType: LimitType;
  onLimitTypeChange: (type: LimitType) => void;
  limitSeconds: number;
  onLimitSecondsChange: (seconds: number) => void;
  limitQuestions: number;
  onLimitQuestionsChange: (count: number) => void;
}

export function LimitSelector({
  limitType,
  onLimitTypeChange,
  limitSeconds,
  onLimitSecondsChange,
  limitQuestions,
  onLimitQuestionsChange,
}: LimitSelectorProps) {
  const { t } = useI18n();
  const minutes = Math.floor(limitSeconds / 60);
  const seconds = limitSeconds % 60;

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">{t('setup.limitType')}</h3>
      <Segmented
        name={t('setup.limitType')}
        value={limitType}
        onChange={onLimitTypeChange}
        options={[
          { value: 'questions', label: t('setup.limitType.questions') },
          { value: 'time', label: t('setup.limitType.time') },
        ]}
      />

      <div className="mt-3">
        {limitType === 'time' ? (
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              id="limit-minutes"
              label={t('setup.limit.minutes')}
              value={minutes}
              min={0}
              max={120}
              onChange={(v) => onLimitSecondsChange(Math.max(0, v || 0) * 60 + seconds)}
            />
            <NumberField
              id="limit-seconds"
              label={t('setup.limit.seconds')}
              value={seconds}
              min={0}
              max={59}
              onChange={(v) => onLimitSecondsChange(minutes * 60 + Math.min(59, Math.max(0, v || 0)))}
            />
          </div>
        ) : (
          <NumberField
            id="limit-questions"
            label={t('setup.limit.questions')}
            value={limitQuestions}
            min={1}
            max={200}
            onChange={(v) => onLimitQuestionsChange(Math.max(1, v || 1))}
          />
        )}
      </div>
    </div>
  );
}
