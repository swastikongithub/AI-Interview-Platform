import React, { useId, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '../../utils/cn';
import { transitions } from '../../motion/tokens';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface SegmentedProps<T extends string> {
  label: string;
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * Radio-group style segmented control. Arrow keys move selection (roving
 * tabindex). The selection pill slides between options (ease-in-out, 200ms)
 * so the change of filter reads as one continuous movement.
 */
export function Segmented<T extends string>({ label, options, value, onChange, className }: SegmentedProps<T>) {
  const groupId = useId();
  const reduce = useReducedMotion();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const last = options.length - 1;
    let next: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = index === last ? 0 : index + 1;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = index === 0 ? last : index - 1;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = last;
    if (next === null) return;
    e.preventDefault();
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        'scrollbar-none inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-sm bg-surface-sunken p-0.5',
        className
      )}
    >
      {options.map((opt, i) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            ref={(el) => (refs.current[i] = el)}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              'relative inline-flex h-8 shrink-0 items-center gap-1.5 rounded-xs px-3 text-body-sm transition-colors duration-quick',
              selected ? 'text-fg' : 'text-fg-muted hover:text-fg'
            )}
          >
            {selected && (
              <motion.span
                layoutId={`${groupId}-pill`}
                className="absolute inset-0 rounded-xs bg-surface shadow-raise"
                transition={reduce ? { duration: 0 } : transitions.move}
                aria-hidden="true"
              />
            )}
            <span className="relative">{opt.label}</span>
            {typeof opt.count === 'number' && (
              <span className="relative font-mono text-micro tabular-nums text-fg-muted">{opt.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
