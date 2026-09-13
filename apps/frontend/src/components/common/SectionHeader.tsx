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
        <span className="text-xs font-mono font-medium tracking-widest text-ink-muted uppercase border-b border-line pb-1 inline-block self-start">
          {eyebrow}
        </span>
      )}
      <h2 className="font-serif text-3xl md:text-4xl text-ink">
        {title}
      </h2>
      {description && (
        <p className="text-ink-muted mt-2 max-w-2xl font-sans text-base leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};
