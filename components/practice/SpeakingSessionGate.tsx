'use client';

import { Button } from '@/components/ui/Button';
import { useI18n } from '@/lib/i18n/I18nProvider';

interface SpeakingSessionGateProps {
  supported: boolean;
  errorMessage: string | undefined;
  onStart: () => void;
}

export function SpeakingSessionGate({ supported, errorMessage, onStart }: SpeakingSessionGateProps) {
  const { t } = useI18n();

  if (!supported) {
    return (
      <p className="text-center text-sm text-amber-700 dark:text-amber-300">{t('practice.speaking.notSupported')}</p>
    );
  }

  return (
    <div className="space-y-4 text-center">
      <p className="text-sm text-slate-500 dark:text-slate-400">{t('practice.speaking.gate.prompt')}</p>
      <button
        type="button"
        onClick={onStart}
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-transform hover:scale-105"
        aria-label={t('practice.speaking.start')}
      >
        <MicIcon />
      </button>
      <Button onClick={onStart}>{t('practice.speaking.start')}</Button>
      {errorMessage ? (
        <p className="text-xs text-rose-600 dark:text-rose-400">{t('practice.speaking.micError', { error: errorMessage })}</p>
      ) : null}
    </div>
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
      <path d="M5 11a7 7 0 0 0 14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 18v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
