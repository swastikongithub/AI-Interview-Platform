import React from 'react';
import { cn } from '../../utils/cn';

export interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  description,
  className,
}) => {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {eyebrow && (
        <span className="text-sm font-semibold tracking-wider text-accent uppercase">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
        {title}
      </h2>
      {description && (
        <p className="text-text-muted mt-1 max-w-2xl text-lg">
          {description}
        </p>
      )}
    </div>
  );
};
