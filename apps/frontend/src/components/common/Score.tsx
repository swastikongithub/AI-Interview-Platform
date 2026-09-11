import React from 'react';
import { cn } from '../../utils/cn';

export interface ScoreProps extends React.HTMLAttributes<HTMLDivElement> {
  score: number; // 0-100
  variant?: 'card' | 'chip';
  className?: string;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-success';
  if (score >= 50) return 'text-warning';
  return 'text-danger';
};

const getScoreBg = (score: number) => {
  if (score >= 80) return 'bg-success/10';
  if (score >= 50) return 'bg-warning/10';
  return 'bg-danger/10';
};

export const Score: React.FC<ScoreProps> = ({ 
  score, 
  variant = 'card', 
  className,
  ...props 
}) => {
  const isCard = variant === 'card';
  const colorClass = getScoreColor(score);
  const bgClass = getScoreBg(score);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center font-display font-semibold transition-all duration-200',
        bgClass,
        colorClass,
        isCard ? 'rounded-card-lg p-6 min-w-[140px]' : 'rounded-pill px-3 py-1 text-sm inline-flex flex-row gap-1.5 min-w-fit items-center',
        className
      )}
      {...props}
      role="meter"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Score: ${score} out of 100`}
    >
      <span className={cn(isCard ? 'text-5xl tracking-tight' : 'text-base font-bold leading-none')}>
        {score}
      </span>
      {isCard && <span className="text-sm font-medium mt-1 opacity-80 uppercase tracking-wide text-text-primary">Score</span>}
    </div>
  );
};

// Explicit exports to satisfy the requirement "ScoreCard & ScoreChip"
export const ScoreCard = (props: Omit<ScoreProps, 'variant'>) => <Score variant="card" {...props} />;
export const ScoreChip = (props: Omit<ScoreProps, 'variant'>) => <Score variant="chip" {...props} />;
