import type { QuestionResult, SessionResult } from './types';

export interface NumberStat {
  number: number;
  attempts: number;
  correctCount: number;
  incorrectCount: number;
  totalTimeMs: number;
  avgTimeMs: number;
}

export interface SessionStats {
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  accuracyPct: number;
  /** Wall-clock duration of the whole session. */
  totalTimeMs: number;
  /** Average of each individual answer's time-to-answer. */
  avgTimeMsPerQuestion: number;
  fastest: QuestionResult | null;
  slowest: QuestionResult | null;
  /** Unique numbers with at least one correct attempt. */
  correctNumbers: number[];
  /** Unique numbers with at least one incorrect attempt. */
  incorrectNumbers: number[];
  perNumberStats: NumberStat[];
  /** Numbers with at least one miss, ranked worst-first. */
  mostDifficult: NumberStat[];
  /** Numbers answered correctly every time, ranked fastest-first. */
  easiest: NumberStat[];
}

const TOP_N = 5;

export function computeResults(session: SessionResult): SessionStats {
  const { answers, startedAt, endedAt } = session;
  const totalQuestions = answers.length;
  const correctCount = answers.filter((a) => a.correct).length;
  const incorrectCount = totalQuestions - correctCount;
  const accuracyPct = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
  const totalTimeMs = Math.max(0, (endedAt ?? Date.now()) - startedAt);
  const avgTimeMsPerQuestion =
    totalQuestions > 0 ? answers.reduce((sum, a) => sum + a.timeMs, 0) / totalQuestions : 0;

  let fastest: QuestionResult | null = null;
  let slowest: QuestionResult | null = null;
  for (const a of answers) {
    if (!fastest || a.timeMs < fastest.timeMs) fastest = a;
    if (!slowest || a.timeMs > slowest.timeMs) slowest = a;
  }

  const byNumber = new Map<number, NumberStat>();
  for (const a of answers) {
    const stat = byNumber.get(a.number) ?? {
      number: a.number,
      attempts: 0,
      correctCount: 0,
      incorrectCount: 0,
      totalTimeMs: 0,
      avgTimeMs: 0,
    };
    stat.attempts += 1;
    stat.totalTimeMs += a.timeMs;
    if (a.correct) stat.correctCount += 1;
    else stat.incorrectCount += 1;
    byNumber.set(a.number, stat);
  }

  const perNumberStats = Array.from(byNumber.values())
    .map((s) => ({ ...s, avgTimeMs: s.attempts > 0 ? s.totalTimeMs / s.attempts : 0 }))
    .sort((a, b) => a.number - b.number);

  const correctNumbers = Array.from(new Set(answers.filter((a) => a.correct).map((a) => a.number))).sort(
    (a, b) => a - b,
  );
  const incorrectNumbers = Array.from(new Set(answers.filter((a) => !a.correct).map((a) => a.number))).sort(
    (a, b) => a - b,
  );

  const mostDifficult = [...perNumberStats]
    .filter((s) => s.incorrectCount > 0)
    .sort((a, b) => b.incorrectCount - a.incorrectCount || b.avgTimeMs - a.avgTimeMs)
    .slice(0, TOP_N);

  const easiest = [...perNumberStats]
    .filter((s) => s.incorrectCount === 0)
    .sort((a, b) => a.avgTimeMs - b.avgTimeMs)
    .slice(0, TOP_N);

  return {
    totalQuestions,
    correctCount,
    incorrectCount,
    accuracyPct,
    totalTimeMs,
    avgTimeMsPerQuestion,
    fastest,
    slowest,
    correctNumbers,
    incorrectNumbers,
    perNumberStats,
    mostDifficult,
    easiest,
  };
}
