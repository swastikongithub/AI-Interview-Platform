import React from 'react';
import { cn } from '../../utils/cn';
import { LucideIcon } from 'lucide-react';

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  className?: string;
  children: React.ReactNode;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({ 
  icon: Icon, 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div
      className={cn(
        'relative bg-surface-dark text-text-inverted rounded-card-lg p-8 shadow-md overflow-hidden transition-all duration-200 hover:shadow-glow',
        className
      )}
      {...props}
    >
      {/* Decorative gradient blur in background */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      
      {Icon && (
        <div className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-elevated border border-border-dark shadow-sm">
          <Icon className="w-6 h-6 text-accent-light" />
        </div>
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
