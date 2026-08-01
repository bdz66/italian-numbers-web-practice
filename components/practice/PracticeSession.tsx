'use client';

import { useEffect, useRef } from 'react';
import { useReducer } from 'react';
import { Card } from '@/components/ui/Card';
import { useTimer } from '@/hooks/useTimer';
import { createQuestionGenerator } from '@/lib/session/generateQuestions';
import { initialSessionState, sessionReducer } from '@/lib/session/sessionReducer';
import type { QuestionResult, SessionConfig, SessionResult } from '@/lib/session/types';
import { ListeningQuestion } from './ListeningQuestion';
import { ProgressHeader } from './ProgressHeader';
import { SpeakingQuestion } from './SpeakingQuestion';

interface PracticeSessionProps {
  config: SessionConfig;
  onFinish: (result: SessionResult) => void;
}

export function PracticeSession({ config, onFinish }: PracticeSessionProps) {
  const generatorRef = useRef(createQuestionGenerator(config.rangeMin, config.rangeMax, config.orderMode));
  const [state, dispatch] = useReducer(sessionReducer, initialSessionState);
  const finishedRef = useRef(false);
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  });

  useEffect(() => {
    finishedRef.current = false;
    generatorRef.current = createQuestionGenerator(config.rangeMin, config.rangeMax, config.orderMode);
    const first = generatorRef.current.next();
    dispatch({ type: 'START', config, firstNumber: first, now: Date.now() });
  }, [config]);

  const isRunning = state.phase === 'running';
  const elapsedMs = useTimer(isRunning);

  const finishWith = (answers: QuestionResult[]) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
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
    dispatch({ type: 'ADVANCE', nextNumber });
  };

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
        ) : (
          <SpeakingQuestion
            key={state.currentIndex}
            number={state.currentNumber}
            languageCode={state.config.numberLanguage}
            onComplete={handleComplete}
          />
        )}
      </Card>
    </div>
  );
}
