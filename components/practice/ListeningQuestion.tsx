'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { getNumberLanguage, type NumberLanguageCode } from '@/lib/numbers/registry';
import type { QuestionResult } from '@/lib/session/types';

interface ListeningQuestionProps {
  number: number;
  languageCode: NumberLanguageCode;
  onComplete: (result: QuestionResult) => void;
}

const FEEDBACK_DELAY_MS = 1100;

export function ListeningQuestion({ number, languageCode, onComplete }: ListeningQuestionProps) {
  const { t } = useI18n();
  const language = getNumberLanguage(languageCode);
  const { supported, hasVoiceForLang, speakText } = useSpeechSynthesis(language.speechLang);
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<{ correct: boolean } | null>(null);
  const presentedAtRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    presentedAtRef.current = Date.now();
    speakText(language.toWords(number));
    inputRef.current?.focus();
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (feedback || inputValue.trim() === '') return;

    const parsed = Number.parseInt(inputValue.trim(), 10);
    const correct = parsed === number;
    const timeMs = Date.now() - presentedAtRef.current;
    setFeedback({ correct });

    timeoutRef.current = window.setTimeout(() => {
      onComplete({ number, userAnswer: inputValue.trim(), correct, timeMs, matchMethod: 'typed' });
    }, FEEDBACK_DELAY_MS);
  };

  return (
    <div className="space-y-4 text-center">
      <p className="text-sm text-slate-500 dark:text-slate-400">{t('practice.listening.prompt')}</p>

      {!hasVoiceForLang ? (
        <p className="text-xs text-amber-600 dark:text-amber-400">{t('practice.voiceWarning')}</p>
      ) : null}

      <button
        type="button"
        onClick={() => speakText(language.toWords(number))}
        disabled={!supported}
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-transform hover:scale-105 disabled:opacity-40"
        aria-label={t('practice.listening.replay')}
      >
        <SpeakerIcon />
      </button>

      <form onSubmit={handleSubmit} className="mx-auto flex max-w-xs flex-col items-center gap-3">
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          value={inputValue}
          disabled={Boolean(feedback)}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t('practice.listening.placeholder')}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-2xl font-semibold text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        <Button type="submit" size="lg" className="w-full" disabled={Boolean(feedback) || inputValue.trim() === ''}>
          {t('practice.listening.submit')}
        </Button>
      </form>

      {feedback ? (
        <p
          className={
            feedback.correct
              ? 'font-semibold text-emerald-600 dark:text-emerald-400'
              : 'font-semibold text-rose-600 dark:text-rose-400'
          }
        >
          {feedback.correct ? t('practice.feedback.correct') : t('practice.feedback.incorrect', { answer: number })}
        </p>
      ) : null}
    </div>
  );
}

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" aria-hidden="true">
      <path d="M4 9v6h4l5 5V4L8 9H4z" fill="currentColor" />
      <path d="M16 8a5 5 0 0 1 0 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}
