import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '../../utils/cn';
import { ease } from '../../motion/tokens';

interface MeterProps {
  label: string;
  /** 0–100. `null` renders an explicit "not scored" state instead of zero. */
  value: number | null | undefined;
  /** Stagger index for grouped reveals. */
  index?: number;
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * Horizontal score meter. The fill scales from the left once on mount —
 * state indication for a rarely-seen result, so it can take ~500ms.
 * transform-only (scaleX), never width.
 */
export const Meter: React.FC<MeterProps> = ({ label, value, index = 0, className, size = 'md' }) => {
  const reduce = useReducedMotion();
  const hasValue = typeof value === 'number' && Number.isFinite(value);
  const clamped = hasValue ? Math.min(100, Math.max(0, value as number)) : 0;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className={cn('text-fg-secondary', size === 'sm' ? 'text-body-sm' : 'text-body')}>{label}</span>
        {hasValue ? (
          <span className="font-mono text-body-sm tabular-nums text-fg">
            {clamped}
            <span className="text-fg-muted">/100</span>
          </span>
        ) : (
          <span className="font-mono text-meta text-fg-muted">Not scored</span>
        )}
      </div>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={hasValue ? clamped : undefined}
        aria-valuetext={hasValue ? `${clamped} out of 100` : 'Not scored'}
        className={cn('overflow-hidden rounded-full bg-surface-sunken', size === 'sm' ? 'h-1' : 'h-1.5')}
      >
        {hasValue && (
          <motion.div
            className="h-full origin-left rounded-full bg-fg"
            initial={reduce ? { opacity: 0, transform: `scaleX(${clamped / 100})` } : { transform: 'scaleX(0)' }}
            animate={{ opacity: 1, transform: `scaleX(${clamped / 100})` }}
            transition={{ duration: reduce ? 0.2 : 0.5, ease: ease.out, delay: reduce ? 0 : 0.1 + index * 0.05 }}
          />
        )}
      </div>
    </div>
  );
};
