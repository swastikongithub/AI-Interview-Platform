import React from 'react';
import { cn } from '../../utils/cn';

export interface LightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export const LightCard: React.FC<LightCardProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        'bg-surface-light rounded-card-lg border border-border-light p-8 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 hover:border-border-dark/20',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
