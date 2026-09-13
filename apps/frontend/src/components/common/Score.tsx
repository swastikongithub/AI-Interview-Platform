import React from 'react';
import { cn } from '../../utils/cn';

export interface ScoreProps extends React.HTMLAttributes<HTMLDivElement> {
  score: number; // 0-100
  variant?: 'card' | 'chip';
  className?: string;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-good';
  if (score >= 50) return 'text-warning';
  return 'text-critical';
};

const getScoreBg = (score: number) => {
  if (score >= 80) return 'bg-good/10 border-good/20';
  if (score >= 50) return 'bg-warning/10 border-warning/20';
  return 'bg-critical/10 border-critical/20';
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
        'flex flex-col items-center justify-center font-sans border transition-all duration-200',
        bgClass,
        colorClass,
        isCard ? 'rounded-md p-6 min-w-[140px]' : 'rounded-sm px-2 py-0.5 text-sm inline-flex flex-row gap-1.5 min-w-fit items-center',
        className
      )}
      {...props}
      role="meter"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Score: ${score} out of 100`}
    >
      <span className={cn(isCard ? 'text-5xl font-serif' : 'text-base font-bold leading-none')}>
        {score}
      </span>
      {isCard && <span className="text-xs font-mono mt-1 uppercase tracking-widest opacity-80 text-ink">Score</span>}
    </div>
  );
};

export const ScoreCard = (props: Omit<ScoreProps, 'variant'>) => <Score variant="card" {...props} />;
export const ScoreChip = (props: Omit<ScoreProps, 'variant'>) => <Score variant="chip" {...props} />;
