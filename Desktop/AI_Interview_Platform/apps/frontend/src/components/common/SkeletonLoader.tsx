import React from 'react';
import { cn } from '../../utils/cn';

export interface SkeletonLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-surface-elevated/10 rounded-card-md',
        className
      )}
      {...props}
    />
  );
};
