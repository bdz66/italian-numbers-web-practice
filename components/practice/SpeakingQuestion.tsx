'use client';

import { useI18n } from '@/lib/i18n/I18nProvider';
import type { RecognitionStatus } from '@/hooks/useSpeechRecognition';

interface SpeakingFeedback {
  correct: boolean;
  transcript: string;
}

interface SpeakingQuestionProps {
  number: number;
  status: RecognitionStatus;
  interimTranscript: string;
  feedback: SpeakingFeedback | null;
}

/**
 * Purely presentational: the microphone is owned once, for the whole session, by
 * PracticeSession (continuous listening — see SpeakingSessionGate). This just displays
 * the current number plus whatever the shared recognizer is hearing right now.
 */
export function SpeakingQuestion({ number, status, interimTranscript, feedback }: SpeakingQuestionProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-5 text-center">
      <p className="text-sm text-slate-500 dark:text-slate-400">{t('practice.speaking.prompt')}</p>
      <p className="text-6xl font-bold tabular-nums">{number}</p>

      <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
        {status === 'listening' ? (
          <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-brand-500" />
        ) : null}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg">
          <MicIcon />
        </div>
      </div>

      <p className="min-h-[1.25rem] text-sm text-slate-500 dark:text-slate-400">
        {status === 'listening' ? interimTranscript || t('practice.speaking.listening') : null}
      </p>

      {feedback ? (
        <div className="space-y-1">
          <p
            className={
              feedback.correct
                ? 'font-semibold text-emerald-600 dark:text-emerald-400'
                : 'font-semibold text-rose-600 dark:text-rose-400'
            }
          >
            {feedback.correct ? t('practice.feedback.correct') : t('practice.feedback.incorrect', { answer: number })}
          </p>
          {feedback.transcript ? (
            <p className="text-xs text-slate-400">{t('practice.speaking.heard', { transcript: feedback.transcript })}</p>
          ) : null}
        </div>
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
