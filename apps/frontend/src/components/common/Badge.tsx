import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'accent' | 'outline';
  className?: string;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  className,
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-paper-raised text-ink border border-line',
    success: 'bg-good/10 text-good border border-good/20',
    warning: 'bg-warning/10 text-warning border border-warning/20',
    danger: 'bg-critical/10 text-critical border border-critical/20',
    accent: 'bg-accent/10 text-accent border border-accent/20',
    outline: 'bg-transparent text-ink-faint border border-line',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-mono font-medium uppercase tracking-widest',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
