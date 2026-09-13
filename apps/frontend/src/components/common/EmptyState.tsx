import React from 'react';
import { cn } from '../../utils/cn';
import { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 md:p-12 border border-dashed border-line rounded-sm bg-paper-raised',
        className
      )}
    >
      {Icon && (
        <div className="mb-4 text-ink-faint">
          <Icon className="w-8 h-8" strokeWidth={1} />
        </div>
      )}
      <h3 className="text-xl font-serif text-ink mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-ink-muted max-w-sm mb-6 font-sans">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};
