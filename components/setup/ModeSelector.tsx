'use client';

import { Segmented } from '@/components/ui/Segmented';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { OrderMode, PracticeMode } from '@/lib/session/types';

interface ModeSelectorProps {
  practiceMode: PracticeMode;
  onPracticeModeChange: (mode: PracticeMode) => void;
  orderMode: OrderMode;
  onOrderModeChange: (mode: OrderMode) => void;
}

export function ModeSelector({
  practiceMode,
  onPracticeModeChange,
  orderMode,
  onOrderModeChange,
}: ModeSelectorProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-sm font-semibold">{t('setup.practiceMode')}</h3>
        <Segmented
          name={t('setup.practiceMode')}
          value={practiceMode}
          onChange={onPracticeModeChange}
          options={[
            {
              value: 'listening',
              label: t('setup.practiceMode.listening'),
              description: t('setup.practiceMode.listening.desc'),
            },
            {
              value: 'speaking',
              label: t('setup.practiceMode.speaking'),
              description: t('setup.practiceMode.speaking.desc'),
            },
          ]}
        />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">{t('setup.orderMode')}</h3>
        <Segmented
          name={t('setup.orderMode')}
          value={orderMode}
          onChange={onOrderModeChange}
          options={[
            {
              value: 'sequential',
              label: t('setup.orderMode.sequential'),
              description: t('setup.orderMode.sequential.desc'),
            },
            {
              value: 'random',
              label: t('setup.orderMode.random'),
              description: t('setup.orderMode.random.desc'),
            },
          ]}
        />
      </div>
    </div>
  );
}
