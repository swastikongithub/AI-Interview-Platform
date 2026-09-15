import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../../utils/cn';

interface PageHeaderProps {
  /** Short orienting label above the title — the workspace or object type. */
  kicker?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  back?: { to: string; label: string };
  className?: string;
}

/**
 * Page opening. Title is set in the display face; the primary action sits on
 * the same baseline so the next step is visible without scrolling.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  kicker,
  title,
  description,
  actions,
  meta,
  back,
  className,
}) => (
  <header className={cn('flex flex-col gap-5 pb-8 md:pb-10', className)}>
    {back && (
      <Link
        to={back.to}
        className="group inline-flex w-fit items-center gap-1.5 rounded-xs text-body-sm text-fg-muted transition-colors duration-quick hover:text-fg"
      >
        <ArrowLeft
          className="size-4 transition-transform duration-quick ease-out group-hover:-translate-x-0.5"
          aria-hidden="true"
        />
        {back.label}
      </Link>
    )}
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0 space-y-3">
        {kicker && <p className="font-mono text-meta uppercase tracking-[0.08em] text-fg-muted">{kicker}</p>}
        <div className="font-display text-display-lg text-fg">{title}</div>
        {description && <div className="max-w-prose text-body-lg text-fg-secondary">{description}</div>}
        {meta && <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">{meta}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  </header>
);

interface SectionProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** Numbered index shown before the title, for ordered workflows. */
  index?: string;
  headingLevel?: 'h2' | 'h3';
}

/** A titled region separated by a top rule rather than wrapped in a card. */
export const Section: React.FC<SectionProps> = ({
  title,
  description,
  actions,
  index,
  headingLevel = 'h2',
  className,
  children,
  ...props
}) => {
  const Heading = headingLevel;
  const headingId = React.useId();
  return (
    <section aria-labelledby={headingId} className={cn('border-t border-edge pt-5', className)} {...props}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <Heading id={headingId} className="flex items-baseline gap-2.5 text-title-md text-fg">
            {index && <span className="font-mono text-meta text-fg-muted">{index}</span>}
            {title}
          </Heading>
          {description && <p className="max-w-prose text-body-sm text-fg-muted">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  );
};

/** A bordered surface — used sparingly for things that are genuinely objects. */
export const Surface: React.FC<React.HTMLAttributes<HTMLDivElement> & { as?: 'div' | 'section' | 'article' | 'aside' }> = ({
  as: Tag = 'div',
  className,
  ...props
}) => <Tag className={cn('rounded-md bg-surface shadow-hairline', className)} {...props} />;

export const KeyValue: React.FC<{ label: string; children: React.ReactNode; mono?: boolean; className?: string }> = ({
  label,
  children,
  mono,
  className,
}) => (
  <div className={cn('min-w-0 space-y-1', className)}>
    <dt className="text-meta text-fg-muted">{label}</dt>
    <dd className={cn('truncate text-body text-fg', mono && 'font-mono text-body-sm')}>{children}</dd>
  </div>
);

export const Avatar: React.FC<{ label: string; className?: string; tone?: 'default' | 'signal' }> = ({
  label,
  className,
  tone = 'default',
}) => (
  <span
    aria-hidden="true"
    className={cn(
      'grid size-9 shrink-0 place-items-center rounded-sm font-mono text-meta font-medium',
      tone === 'signal' ? 'bg-signal text-signal-fg' : 'bg-surface-sunken text-fg-secondary',
      className
    )}
  >
    {label}
  </span>
);
