import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-pill transition-all outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100';
    
    const variants = {
      primary: 'bg-surface-dark text-text-inverted hover:bg-surface-elevated',
      secondary: 'bg-border-light text-text-primary hover:bg-border-dark hover:text-text-inverted',
      accent: 'bg-accent text-white hover:bg-accent-hover',
      ghost: 'bg-transparent text-text-primary hover:bg-border-light',
    };

    const sizes = {
      sm: 'text-sm px-4 py-1.5',
      md: 'text-base px-6 py-2.5',
      lg: 'text-lg px-8 py-3.5',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        aria-disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
