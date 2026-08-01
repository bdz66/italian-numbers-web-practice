import type { OrderMode } from './types';

export interface QuestionGenerator {
  next: () => number;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = copy[i];
    const b = copy[j];
    if (a === undefined || b === undefined) continue;
    copy[i] = b;
    copy[j] = a;
  }
  return copy;
}

export function normalizeRange(min: number, max: number): [number, number] {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  return [Math.round(lo), Math.round(hi)];
}

/**
 * Lazily yields numbers from `[rangeMin, rangeMax]` forever: in order for 'sequential'
 * (cycling back to rangeMin), or reshuffled each lap for 'random'. Callers (the session
 * controller) decide when to stop pulling — this generator doesn't know about limits.
 */
export function createQuestionGenerator(rangeMin: number, rangeMax: number, orderMode: OrderMode): QuestionGenerator {
  const [lo, hi] = normalizeRange(rangeMin, rangeMax);
  const base: number[] = [];
  for (let n = lo; n <= hi; n++) base.push(n);
  if (base.length === 0) base.push(lo);

  let queue: number[] = orderMode === 'random' ? shuffle(base) : [...base];
  let cursor = 0;
  let lastValue: number | undefined;

  function refill(): void {
    const nextLap = orderMode === 'random' ? shuffle(base) : [...base];
    if (orderMode === 'random' && nextLap.length > 1 && nextLap[0] === lastValue) {
      const first = nextLap[0];
      const second = nextLap[1];
      if (first !== undefined && second !== undefined) {
        nextLap[0] = second;
        nextLap[1] = first;
      }
    }
    queue = nextLap;
    cursor = 0;
  }

  return {
    next(): number {
      if (cursor >= queue.length) refill();
      const value = queue[cursor] ?? lo;
      cursor += 1;
      lastValue = value;
      return value;
    },
  };
}
