'use client';

import { Button } from '@/components/ui/Button';
import { useI18n } from '@/lib/i18n/I18nProvider';

export function StopButton({ onStop }: { onStop: () => void }) {
  const { t } = useI18n();
  return (
    <Button variant="danger" onClick={onStop}>
      {t('practice.stop')}
    </Button>
  );
}
