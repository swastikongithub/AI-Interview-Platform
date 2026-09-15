import React from 'react';
import { cn } from '../../utils/cn';

/** Small inline busy indicator. Always pair with visible or accessible text. */
export const Spinner: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    className={cn('size-4 shrink-0 animate-spin motion-reduce:animate-none', className)}
  >
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
    <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
