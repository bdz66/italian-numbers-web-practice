import type { OrderMode, SessionConfig } from './types';

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

/** Widest span a single "a-b" token is allowed to expand to, so a typo can't hang the page. */
const MAX_CUSTOM_RANGE_SPAN = 2000;

/**
 * Splits a custom number list on spaces and/or commas, e.g. "1 23 543" or "1, 23, 543".
 * Tokens may also be a range like "10-15" (or "15-10"), which expands to every number
 * in between, inclusive.
 */
export function parseCustomNumberList(raw: string | undefined | null): number[] {
  if (!raw) return [];

  const numbers: number[] = [];
  const tokens = raw
    .split(/[\s,]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);

  for (const token of tokens) {
    const rangeMatch = /^(\d+)-(\d+)$/.exec(token);
    if (rangeMatch) {
      const [lo, hi] = normalizeRange(Number.parseInt(rangeMatch[1] ?? '', 10), Number.parseInt(rangeMatch[2] ?? '', 10));
      if (hi - lo + 1 > MAX_CUSTOM_RANGE_SPAN) continue;
      for (let n = lo; n <= hi; n++) numbers.push(n);
      continue;
    }

    const n = Number.parseInt(token, 10);
    if (Number.isFinite(n) && n >= 0) numbers.push(n);
  }

  return numbers;
}

/** Resolves the pool of numbers a session draws questions from, per `numberSource`. Duplicates are kept. */
export function resolveNumberPool(config: SessionConfig): number[] {
  if (config.numberSource === 'custom') {
    const parsed = parseCustomNumberList(config.customNumbersRaw);
    return parsed.length > 0 ? parsed : [0];
  }
  const [lo, hi] = normalizeRange(config.rangeMin, config.rangeMax);
  const pool: number[] = [];
  for (let n = lo; n <= hi; n++) pool.push(n);
  return pool.length > 0 ? pool : [lo];
}

/**
 * Sequential practice means "go through the pool once, in order" — a separate
 * time/question limit doesn't make sense there (a question-count limit larger than the
 * pool would otherwise wrap around and repeat numbers, which isn't "sequential"
 * anymore). This resolves the config actually used to run a session: for sequential
 * order, the limit is pinned to exactly one pass over the (normalized) range — a custom
 * number list is only offered for random order, so sequential always falls back to
 * 'range' — while random order uses the user's chosen source and limit as-is.
 */
export function resolveRunConfig(config: SessionConfig): SessionConfig {
  const [rangeMin, rangeMax] = normalizeRange(config.rangeMin, config.rangeMax);
  const base: SessionConfig = { ...config, rangeMin, rangeMax };
  if (config.orderMode === 'sequential') {
    return {
      ...base,
      numberSource: 'range',
      limitType: 'questions',
      limitQuestions: rangeMax - rangeMin + 1,
    };
  }
  return base;
}

/**
 * Lazily yields numbers from `pool` forever: in order for 'sequential' (cycling back to
 * the start), or reshuffled each lap for 'random'. Callers (the session controller)
 * decide when to stop pulling — this generator doesn't know about limits.
 */
export function createQuestionGenerator(pool: number[], orderMode: OrderMode): QuestionGenerator {
  const base = pool.length > 0 ? pool : [0];

  let queue: number[] = orderMode === 'random' ? shuffle(base) : [...base];
  let cursor = 0;
  let lastValue: number | undefined;

  function refill(): void {
    const nextLap = orderMode === 'random' ? shuffle(base) : [...base];
    // Swapping to dodge a repeat only adds variety when there's a genuine alternative
    // first pick left after the swap. At exactly 2 items, "avoid this one value" pins
    // the order down to a single possibility, so every future lap is forced into the
    // same order forever — the sequence degenerates from random into a fixed
    // back-and-forth. Above 2 items there's always another valid candidate, so the
    // swap stays a light nudge instead of an outcome-determining constraint.
    if (orderMode === 'random' && nextLap.length > 2 && nextLap[0] === lastValue) {
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
      const value = queue[cursor] ?? base[0] ?? 0;
      cursor += 1;
      lastValue = value;
      return value;
    },
  };
}
