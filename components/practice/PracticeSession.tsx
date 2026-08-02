'use client';

import { useEffect, useReducer, useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTimer } from '@/hooks/useTimer';
import { getNumberLanguage } from '@/lib/numbers/registry';
import { createQuestionGenerator, resolveNumberPool } from '@/lib/session/generateQuestions';
import { initialSessionState, sessionReducer } from '@/lib/session/sessionReducer';
import type { QuestionResult, SessionConfig, SessionResult } from '@/lib/session/types';
import { ListeningQuestion } from './ListeningQuestion';
import { ProgressHeader } from './ProgressHeader';
import { SpeakingQuestion } from './SpeakingQuestion';
import { SpeakingSessionGate } from './SpeakingSessionGate';

interface PracticeSessionProps {
  config: SessionConfig;
  onFinish: (result: SessionResult) => void;
}

interface SpokenFeedback {
  correct: boolean;
  transcript: string;
}

/** Cosmetic pause after a spoken answer so feedback is visible before the next number appears. */
const SPEAKING_FEEDBACK_DELAY_MS = 900;

export function PracticeSession({ config, onFinish }: PracticeSessionProps) {
  const generatorRef = useRef(createQuestionGenerator(resolveNumberPool(config), config.orderMode));
  const [state, dispatch] = useReducer(sessionReducer, initialSessionState);
  const finishedRef = useRef(false);
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  });

  // Speaking mode: the mic is opened once for the whole session (see SpeakingSessionGate)
  // rather than per question, so timing/guarding state lives here, not in a per-question
  // component that would otherwise get remounted (and lose it) each question.
  const [micStarted, setMicStarted] = useState(false);
  const [spokenFeedback, setSpokenFeedback] = useState<SpokenFeedback | null>(null);
  const presentedAtRef = useRef(0);
  const awaitingAnswerRef = useRef(true);
  const feedbackTimeoutRef = useRef<number | undefined>(undefined);
  // `finishWith` needs to stop the mic, but the hook that owns it needs a completion
  // callback that itself can call `finishWith` — a ref sidesteps that circular reference.
  const speechStopRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    finishedRef.current = false;
    generatorRef.current = createQuestionGenerator(resolveNumberPool(config), config.orderMode);
    const first = generatorRef.current.next();
    presentedAtRef.current = Date.now();
    awaitingAnswerRef.current = true;
    dispatch({ type: 'START', config, firstNumber: first, now: Date.now() });
  }, [config]);

  useEffect(
    () => () => {
      if (feedbackTimeoutRef.current !== undefined) window.clearTimeout(feedbackTimeoutRef.current);
    },
    [],
  );

  const isRunning = state.phase === 'running';
  const elapsedMs = useTimer(isRunning);

  const finishWith = (answers: QuestionResult[]) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    speechStopRef.current();
    const now = Date.now();
    dispatch({ type: 'FINISH', now });
    onFinishRef.current({ config: state.config, startedAt: state.startedAt, endedAt: now, answers });
  };

  useEffect(() => {
    if (config.limitType !== 'time' || !isRunning) return;
    if (elapsedMs >= config.limitSeconds * 1000) {
      finishWith(state.answers);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsedMs, isRunning, config.limitType, config.limitSeconds]);

  const handleStop = () => finishWith(state.answers);

  const handleComplete = (result: QuestionResult) => {
    dispatch({ type: 'ANSWERED', result });
    const nextIndex = state.currentIndex + 1;
    if (config.limitType === 'questions' && nextIndex >= config.limitQuestions) {
      finishWith([...state.answers, result]);
      return;
    }
    const nextNumber = generatorRef.current.next();
    presentedAtRef.current = Date.now();
    awaitingAnswerRef.current = true;
    dispatch({ type: 'ADVANCE', nextNumber });
  };

  const language = getNumberLanguage(config.numberLanguage);
  const speech = useSpeechRecognition({
    lang: language.speechLang,
    continuous: true,
    onFinalResult: (transcripts) => {
      if (!awaitingAnswerRef.current) return;
      awaitingAnswerRef.current = false;

      const number = state.currentNumber;
      const match = language.compareSpokenToNumber(transcripts, number);
      const timeMs = Date.now() - presentedAtRef.current;
      const heard = transcripts[0] ?? '';
      const result: QuestionResult = {
        number,
        userAnswer: heard,
        correct: match.isMatch,
        timeMs,
        matchMethod: match.isMatch ? match.method : 'none',
      };

      setSpokenFeedback({ correct: match.isMatch, transcript: heard });
      feedbackTimeoutRef.current = window.setTimeout(() => {
        setSpokenFeedback(null);
        handleComplete(result);
      }, SPEAKING_FEEDBACK_DELAY_MS);
    },
  });

  useEffect(() => {
    speechStopRef.current = speech.stop;
  });

  if (state.phase !== 'running') return null;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <ProgressHeader config={state.config} currentIndex={state.currentIndex} elapsedMs={elapsedMs} onStop={handleStop} />
      <Card>
        {state.config.practiceMode === 'listening' ? (
          <ListeningQuestion
            key={state.currentIndex}
            number={state.currentNumber}
            languageCode={state.config.numberLanguage}
            onComplete={handleComplete}
          />
        ) : !micStarted ? (
          <SpeakingSessionGate
            supported={speech.supported}
            errorMessage={speech.errorMessage}
            onStart={() => {
              setMicStarted(true);
              presentedAtRef.current = Date.now();
              awaitingAnswerRef.current = true;
              speech.start();
            }}
          />
        ) : (
          <SpeakingQuestion
            number={state.currentNumber}
            status={speech.status}
            interimTranscript={speech.interimTranscript}
            feedback={spokenFeedback}
          />
        )}
      </Card>
    </div>
  );
}
