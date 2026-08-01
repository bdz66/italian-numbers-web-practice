'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Tracks elapsed milliseconds while `isRunning` is true. Assumes the caller remounts
 * this hook's owning component for each new timed run (state then resets naturally).
 */
export function useTimer(isRunning: boolean, intervalMs = 100): number {
  const [elapsedMs, setElapsedMs] = useState(0);
  const startRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);

  useEffect(() => {
    if (!isRunning) {
      if (startRef.current !== null) {
        accumulatedRef.current += Date.now() - startRef.current;
        startRef.current = null;
      }
      return;
    }

    startRef.current = Date.now();
    const id = window.setInterval(() => {
      const start = startRef.current ?? Date.now();
      setElapsedMs(accumulatedRef.current + (Date.now() - start));
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [isRunning, intervalMs]);

  return elapsedMs;
}
