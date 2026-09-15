import React from 'react';
import {
  AlertTriangle,
  Ban,
  Compass,
  Inbox,
  RefreshCw,
  WifiOff,
  Hourglass,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';
import type { ApiErrorInfo } from '../../lib/format';

export type StateKind = 'empty' | 'error' | 'network' | 'forbidden' | 'not_found' | 'pending';

const kindIcon: Record<StateKind, LucideIcon> = {
  empty: Inbox,
  error: AlertTriangle,
  network: WifiOff,
  forbidden: Ban,
  not_found: Compass,
  pending: Hourglass,
};

const kindAccent: Record<StateKind, string> = {
  empty: 'text-fg-muted bg-surface-sunken',
  error: 'text-negative bg-negative-soft',
  network: 'text-caution bg-caution-soft',
  forbidden: 'text-negative bg-negative-soft',
  not_found: 'text-fg-muted bg-surface-sunken',
  pending: 'text-caution bg-caution-soft',
};

interface StateBlockProps {
  kind: StateKind;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  icon?: LucideIcon;
  /** `inline` sits inside a section; `page` anchors a whole view. */
  size?: 'inline' | 'page';
  className?: string;
}

/**
 * Left-aligned state message with an icon tile. Deliberately not a giant
 * centered box: the message reads like part of the page it belongs to.
 */
export const StateBlock: React.FC<StateBlockProps> = ({
  kind,
  title,
  description,
  actions,
  icon,
  size = 'inline',
  className,
}) => {
  const Icon = icon ?? kindIcon[kind];
  const isAlert = kind === 'error' || kind === 'network' || kind === 'forbidden';
  return (
    <div
      role={isAlert ? 'alert' : undefined}
      className={cn(
        'flex gap-4',
        size === 'page' ? 'max-w-xl flex-col py-10 sm:flex-row sm:py-16' : 'items-start py-6',
        className
      )}
    >
      <span
        className={cn(
          'grid shrink-0 place-items-center rounded-md',
          size === 'page' ? 'size-12' : 'size-10',
          kindAccent[kind]
        )}
        aria-hidden="true"
      >
        <Icon className={size === 'page' ? 'size-6' : 'size-5'} strokeWidth={1.75} />
      </span>
      <div className="min-w-0 space-y-1.5">
        <p className={cn('text-fg', size === 'page' ? 'font-display text-display-md' : 'text-title-md')}>{title}</p>
        {description && <div className="max-w-prose text-body text-fg-secondary">{description}</div>}
        {actions && <div className="flex flex-wrap gap-2 pt-2">{actions}</div>}
      </div>
    </div>
  );
};

/** Maps a normalised API error to an honest state with an optional retry. */
export const ErrorState: React.FC<{
  error: ApiErrorInfo;
  title?: string;
  onRetry?: () => void;
  retrying?: boolean;
  size?: 'inline' | 'page';
  className?: string;
}> = ({ error, title, onRetry, retrying, size, className }) => {
  const kind: StateKind =
    error.kind === 'network' ? 'network' : error.kind === 'forbidden' ? 'forbidden' : error.kind === 'not_found' ? 'not_found' : 'error';
  const defaultTitle: Record<StateKind, string> = {
    network: 'Connection lost',
    forbidden: 'Not available to your role',
    not_found: 'Nothing here',
    error: 'This didn’t load',
    empty: '',
    pending: '',
  };
  return (
    <StateBlock
      kind={kind}
      size={size}
      className={className}
      title={title ?? defaultTitle[kind]}
      description={error.message}
      actions={
        onRetry && kind !== 'forbidden' && kind !== 'not_found' ? (
          <Button variant="secondary" size="sm" onClick={onRetry} loading={retrying} leadingIcon={<RefreshCw />}>
            Try again
          </Button>
        ) : undefined
      }
    />
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('skeleton rounded-xs', className)} aria-hidden="true" />
);

/** Row-shaped loading placeholder for lists and tables. */
export const ListSkeleton: React.FC<{ rows?: number; label: string; className?: string }> = ({
  rows = 4,
  label,
  className,
}) => (
  <div className={cn('divide-y divide-edge', className)} role="status" aria-label={label}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 py-4">
        <Skeleton className="size-9 rounded-sm" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-2/5" />
          <Skeleton className="h-3 w-1/4" />
        </div>
        <Skeleton className="hidden h-6 w-20 sm:block" />
      </div>
    ))}
    <span className="sr-only">{label}</span>
  </div>
);
