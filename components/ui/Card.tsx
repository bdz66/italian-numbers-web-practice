import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card p-5 sm:p-6 ${className}`}>{children}</div>;
}
