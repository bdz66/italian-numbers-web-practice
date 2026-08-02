'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { isSTTSupported } from '@/lib/speech/support';
import { normalizeRange, parseCustomNumberList } from '@/lib/session/generateQuestions';
import type { SessionConfig } from '@/lib/session/types';
import { STORAGE_KEYS } from '@/lib/storage/localStorage';
import type { HistoryEntry } from '@/lib/storage/history';
import { CustomNumberListInput } from './CustomNumberListInput';
import { LanguageToggle } from './LanguageToggle';
import { LimitSelector } from './LimitSelector';
import { ModeSelector } from './ModeSelector';
import { NumberSourceToggle } from './NumberSourceToggle';
import { RangeSelector } from './RangeSelector';
import { RecentSessions } from './RecentSessions';

interface SetupFormProps {
  config: SessionConfig;
  onConfigChange: (config: SessionConfig) => void;
  onStart: (config: SessionConfig) => void;
  history: HistoryEntry[];
  onClearHistory: () => void;
}

export function SetupForm({ config, onConfigChange, onStart, history, onClearHistory }: SetupFormProps) {
  const { t } = useI18n();
  const [sttSupported, setSttSupported] = useState(true);
  const [showWritten, setShowWritten] = useLocalStorage(STORAGE_KEYS.showWrittenForm, false);

  useEffect(() => {
    // Feature-detects a browser API unavailable during SSR — can't be a lazy useState
    // initializer without a hydration mismatch (server always assumes unsupported).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSttSupported(isSTTSupported());
  }, []);

  const isCustomSource = config.orderMode === 'random' && config.numberSource === 'custom';
  const customNumbersEmpty = isCustomSource && parseCustomNumberList(config.customNumbersRaw).length === 0;

  const handleStart = () => {
    if (customNumbersEmpty) return;
    const [rangeMin, rangeMax] = normalizeRange(config.rangeMin, config.rangeMax);
    onStart({ ...config, rangeMin, rangeMax });
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{t('app.title')}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('app.tagline')}</p>
        </div>
        <LanguageToggle />
      </div>

      <Card className="space-y-6">
        <ModeSelector
          practiceMode={config.practiceMode}
          onPracticeModeChange={(practiceMode) => onConfigChange({ ...config, practiceMode })}
          orderMode={config.orderMode}
          onOrderModeChange={(orderMode) =>
            onConfigChange({
              ...config,
              orderMode,
              // A custom number list is only offered for random order.
              numberSource: orderMode === 'sequential' ? 'range' : config.numberSource,
            })
          }
        />

        {config.practiceMode === 'speaking' && !sttSupported ? (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            {t('practice.speaking.notSupported')}
          </p>
        ) : null}

        {config.practiceMode === 'listening' ? (
          <div className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
            <span className="text-sm text-slate-600 dark:text-slate-300">{t('practice.listening.showWritten')}</span>
            <Switch
              id="show-written-form-setup"
              checked={showWritten}
              onChange={setShowWritten}
              ariaLabel={t('practice.listening.showWritten')}
            />
          </div>
        ) : null}

        {config.orderMode === 'random' ? (
          <NumberSourceToggle
            value={config.numberSource}
            onChange={(numberSource) => onConfigChange({ ...config, numberSource })}
          />
        ) : null}

        {isCustomSource ? (
          <CustomNumberListInput
            value={config.customNumbersRaw}
            onChange={(customNumbersRaw) => onConfigChange({ ...config, customNumbersRaw })}
          />
        ) : (
          <RangeSelector
            min={config.rangeMin}
            max={config.rangeMax}
            onChange={(rangeMin, rangeMax) => onConfigChange({ ...config, rangeMin, rangeMax })}
          />
        )}

        {config.orderMode === 'sequential' ? (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {t('setup.sequentialInfo', {
              count: Math.abs(config.rangeMax - config.rangeMin) + 1,
            })}
          </p>
        ) : (
          <LimitSelector
            limitType={config.limitType}
            onLimitTypeChange={(limitType) => onConfigChange({ ...config, limitType })}
            limitSeconds={config.limitSeconds}
            onLimitSecondsChange={(limitSeconds) => onConfigChange({ ...config, limitSeconds })}
            limitQuestions={config.limitQuestions}
            onLimitQuestionsChange={(limitQuestions) => onConfigChange({ ...config, limitQuestions })}
          />
        )}

        <Button size="lg" className="w-full" onClick={handleStart} disabled={customNumbersEmpty}>
          {t('setup.start')}
        </Button>
        <p className="text-center text-xs text-slate-400 dark:text-slate-500">{t('setup.privacyNote')}</p>
      </Card>

      <Card>
        <RecentSessions entries={history} onClear={onClearHistory} />
      </Card>
    </div>
  );
}
