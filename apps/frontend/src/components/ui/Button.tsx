import React from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'signal' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'pressable relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-sm font-medium ' +
  'disabled:cursor-not-allowed disabled:opacity-45 aria-disabled:cursor-not-allowed aria-disabled:opacity-45';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-fg text-fg-inverse hover:bg-fg/85',
  signal: 'bg-signal text-signal-fg hover:bg-signal/85',
  secondary: 'bg-surface text-fg shadow-hairline hover:bg-surface-hover hover:shadow-[0_0_0_1px_rgb(var(--c-edge-strong))]',
  ghost: 'bg-transparent text-fg-secondary hover:bg-surface-hover hover:text-fg',
  danger: 'bg-negative text-white hover:bg-negative/85',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-body-sm [&_svg]:size-3.5',
  md: 'h-10 px-4 text-body [&_svg]:size-4',
  lg: 'h-12 px-5 text-body-lg [&_svg]:size-[1.125rem]',
};

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner, disables the button, and announces the busy state. */
  loading?: boolean;
  /** Replaces the label while loading, e.g. "Saving…". */
  loadingLabel?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      loadingLabel,
      leadingIcon,
      trailingIcon,
      className,
      children,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      className={buttonClasses(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner /> : leadingIcon}
      <span>{loading && loadingLabel ? loadingLabel : children}</span>
      {!loading && trailingIcon}
    </button>
  )
);
Button.displayName = 'Button';

export interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  ({ variant = 'primary', size = 'md', leadingIcon, trailingIcon, className, children, ...props }, ref) => (
    <Link ref={ref} className={buttonClasses(variant, size, className)} {...props}>
      {leadingIcon}
      <span>{children}</span>
      {trailingIcon}
    </Link>
  )
);
ButtonLink.displayName = 'ButtonLink';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required accessible name — icon buttons have no visible text. */
  label: string;
  variant?: Extract<ButtonVariant, 'ghost' | 'secondary'>;
  size?: 'sm' | 'md';
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, variant = 'ghost', size = 'md', className, children, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        base,
        variants[variant],
        size === 'sm' ? 'size-8 [&_svg]:size-4' : 'size-10 [&_svg]:size-[1.125rem]',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);
IconButton.displayName = 'IconButton';
