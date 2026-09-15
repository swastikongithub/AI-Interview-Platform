import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { StatusMeta, Tone } from '../../lib/status';

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-surface-sunken text-fg-secondary',
  signal: 'bg-signal-soft text-signal-text',
  positive: 'bg-positive-soft text-positive',
  caution: 'bg-caution-soft text-caution',
  negative: 'bg-negative-soft text-negative',
  info: 'bg-info-soft text-info',
};

interface StatusBadgeProps {
  /** Status metadata — always renders an icon plus a text label, never color alone. */
  meta?: StatusMeta;
  tone?: Tone;
  icon?: LucideIcon;
  children?: React.ReactNode;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ meta, tone, icon, children, className }) => {
  const Icon = icon ?? meta?.icon;
  const resolvedTone = tone ?? meta?.tone ?? 'neutral';
  return (
    <span
      className={cn(
        'inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xs px-2 text-meta font-medium',
        toneClasses[resolvedTone],
        className
      )}
    >
      {Icon && <Icon className="size-3.5" aria-hidden="true" strokeWidth={2.25} />}
      {children ?? meta?.label}
    </span>
  );
};

/** A quiet dot + label used inside dense rows where a filled badge is too loud. */
export const StatusDot: React.FC<{ meta: StatusMeta; className?: string }> = ({ meta, className }) => {
  const dot: Record<Tone, string> = {
    neutral: 'bg-fg-muted',
    signal: 'bg-signal',
    positive: 'bg-positive',
    caution: 'bg-caution',
    negative: 'bg-negative',
    info: 'bg-info',
  };
  return (
    <span className={cn('inline-flex items-center gap-2 whitespace-nowrap text-body-sm text-fg-secondary', className)}>
      <span className={cn('size-1.5 rounded-full', dot[meta.tone])} aria-hidden="true" />
      {meta.label}
    </span>
  );
};
