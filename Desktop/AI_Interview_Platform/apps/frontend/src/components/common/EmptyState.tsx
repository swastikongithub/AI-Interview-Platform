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
        'flex flex-col items-center justify-center text-center p-section-md',
        className
      )}
    >
      {Icon && (
        <div className="bg-surface-elevated/5 p-4 rounded-full mb-6">
          <Icon className="w-8 h-8 text-text-tertiary" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-text-primary mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-text-muted max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};
