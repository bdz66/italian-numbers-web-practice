/** "MM:SS" — for countdowns/elapsed session clocks. */
export function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/** "1.2s" — for per-question timing stats. */
export function formatSeconds(ms: number): string {
  return `${(Math.max(0, ms) / 1000).toFixed(1)}s`;
}
