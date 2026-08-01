'use client';

import { Segmented } from '@/components/ui/Segmented';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { NumberSource } from '@/lib/session/types';

interface NumberSourceToggleProps {
  value: NumberSource;
  onChange: (value: NumberSource) => void;
}

export function NumberSourceToggle({ value, onChange }: NumberSourceToggleProps) {
  const { t } = useI18n();

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">{t('setup.numberSource')}</h3>
      <Segmented
        name={t('setup.numberSource')}
        value={value}
        onChange={onChange}
        options={[
          { value: 'range', label: t('setup.numberSource.range'), description: t('setup.numberSource.range.desc') },
          {
            value: 'custom',
            label: t('setup.numberSource.custom'),
            description: t('setup.numberSource.custom.desc'),
          },
        ]}
      />
    </div>
  );
}
