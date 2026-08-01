'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { getNumberLanguage, type NumberLanguageCode } from '@/lib/numbers/registry';
import type { QuestionResult } from '@/lib/session/types';

interface SpeakingQuestionProps {
  number: number;
  languageCode: NumberLanguageCode;
  onComplete: (result: QuestionResult) => void;
}

const FEEDBACK_DELAY_MS = 1300;

export function SpeakingQuestion({ number, languageCode, onComplete }: SpeakingQuestionProps) {
  const { t } = useI18n();
  const language = getNumberLanguage(languageCode);
  const presentedAtRef = useRef(0);
  const timeoutRef = useRef<number | undefined>(undefined);
  const feedbackRef = useRef<{ correct: boolean; transcript: string } | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; transcript: string } | null>(null);

  const { supported, status, interimTranscript, start } = useSpeechRecognition({
    lang: language.speechLang,
    onFinalResult: (transcripts) => {
      if (feedbackRef.current) return;
      const match = language.compareSpokenToNumber(transcripts, number);
      const timeMs = Date.now() - presentedAtRef.current;
      const heard = transcripts[0] ?? '';
      const next = { correct: match.isMatch, transcript: heard };
      feedbackRef.current = next;
      setFeedback(next);

      timeoutRef.current = window.setTimeout(() => {
        onComplete({
          number,
          userAnswer: heard,
          correct: match.isMatch,
          timeMs,
          matchMethod: match.isMatch ? match.method : 'none',
        });
      }, FEEDBACK_DELAY_MS);
    },
  });

  useEffect(() => {
    presentedAtRef.current = Date.now();
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!supported) {
    return (
      <p className="text-center text-sm text-amber-700 dark:text-amber-300">{t('practice.speaking.notSupported')}</p>
    );
  }

  const showRetry = (status === 'no-speech' || status === 'error') && !feedback;

  return (
    <div className="space-y-5 text-center">
      <p className="text-sm text-slate-500 dark:text-slate-400">{t('practice.speaking.prompt')}</p>
      <p className="text-6xl font-bold tabular-nums">{number}</p>

      <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
        {status === 'listening' ? (
          <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-brand-500" />
        ) : null}
        <button
          type="button"
          onClick={start}
          disabled={status === 'listening' || Boolean(feedback)}
          className="relative flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-transform hover:scale-105 disabled:opacity-60"
          aria-label={t('practice.speaking.start')}
        >
          <MicIcon />
        </button>
      </div>

      <p className="min-h-[1.25rem] text-sm text-slate-500 dark:text-slate-400">
        {status === 'listening' ? interimTranscript || t('practice.speaking.listening') : null}
        {status !== 'listening' && !feedback && !showRetry ? t('practice.speaking.start') : null}
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

      {showRetry ? (
        <Button variant="secondary" onClick={start}>
          {t('practice.speaking.retry')}
        </Button>
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
