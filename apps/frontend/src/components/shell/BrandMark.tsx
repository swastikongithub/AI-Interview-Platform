import React from 'react';
import { cn } from '../../utils/cn';

/** Product mark: an apex over a signal point. Decorative — pair with the wordmark or an aria-label. */
export const BrandMark: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={cn('size-8 shrink-0', className)}>
    <rect width="32" height="32" rx="8" className="fill-fg" />
    <path
      d="M9 22.5 16 8l7 14.5"
      className="stroke-canvas"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="16" cy="19" r="3" className="fill-signal" />
  </svg>
);

export const Wordmark: React.FC<{ className?: string }> = ({ className }) => (
  <span className={cn('font-display text-[1.1875rem] font-semibold tracking-[-0.03em] text-fg', className)}>
    Antigravity
  </span>
);
