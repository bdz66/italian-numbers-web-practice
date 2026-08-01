'use client';

import { useEffect, useState } from 'react';
import { PracticeSession } from '@/components/practice/PracticeSession';
import { ResultsSummary } from '@/components/results/ResultsSummary';
import { SetupForm } from '@/components/setup/SetupForm';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { computeResults } from '@/lib/session/stats';
import { DEFAULT_SESSION_CONFIG, type SessionConfig, type SessionResult } from '@/lib/session/types';
import { appendHistoryEntry, clearHistory, loadHistory, type HistoryEntry } from '@/lib/storage/history';
import { STORAGE_KEYS } from '@/lib/storage/localStorage';

type Screen = 'setup' | 'practice' | 'results';

export default function Home() {
  const [config, setConfig] = useLocalStorage<SessionConfig>(STORAGE_KEYS.settings, DEFAULT_SESSION_CONFIG);
  const [screen, setScreen] = useState<Screen>('setup');
  const [lastSession, setLastSession] = useState<SessionResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    // Reads localStorage, unavailable during SSR — can't be a lazy useState initializer
    // without a hydration mismatch (server always renders an empty history list).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHistory(loadHistory());
  }, []);

  const handleFinish = (result: SessionResult) => {
    const stats = computeResults(result);
    const entry: HistoryEntry = {
      id: `${result.startedAt}-${Math.random().toString(36).slice(2, 8)}`,
      completedAt: result.endedAt,
      config: result.config,
      totalQuestions: stats.totalQuestions,
      correctCount: stats.correctCount,
      accuracyPct: stats.accuracyPct,
      totalTimeMs: stats.totalTimeMs,
    };
    setHistory(appendHistoryEntry(entry));
    setLastSession(result);
    setScreen('results');
  };

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-8 sm:py-12">
      {screen === 'setup' ? (
        <SetupForm
          config={config}
          onConfigChange={setConfig}
          onStart={(nextConfig) => {
            setConfig(nextConfig);
            setScreen('practice');
          }}
          history={history}
          onClearHistory={() => setHistory(clearHistory())}
        />
      ) : null}

      {screen === 'practice' ? <PracticeSession config={config} onFinish={handleFinish} /> : null}

      {screen === 'results' && lastSession ? (
        <ResultsSummary session={lastSession} onNewSession={() => setScreen('setup')} />
      ) : null}
    </main>
  );
}
