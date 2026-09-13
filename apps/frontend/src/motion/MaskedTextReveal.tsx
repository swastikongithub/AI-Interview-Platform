import React, { useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { useOnceInView, useReducedMotionPreference } from './hooks';

interface MaskedTextRevealProps {
  text: string;
  delay?: number;
  className?: string;
  as?: React.ElementType;
}

export const MaskedTextReveal: React.FC<MaskedTextRevealProps> = ({ 
  text, 
  delay = 0, 
  className,
  as = 'span' 
}) => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useOnceInView(ref);
  const reduceMotion = useReducedMotionPreference();
  // See Reveal.tsx: motion.create() must be memoized, not called fresh every render,
  // or this subtree fully remounts (losing focus/state) on every parent re-render.
  const Component = useMemo(() => motion.create(as as any), [as]);

  if (reduceMotion) {
    return <Component className={className}>{text}</Component>;
  }

  // Split text by words
  const words = text.split(' ');

  return (
    <Component ref={ref} className={className} style={{ display: 'inline-block', overflow: 'hidden' }}>
      {words.map((word, idx) => (
        <span key={idx} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', marginRight: '0.25em' }}>
          <motion.span
            style={{ display: 'inline-block' }}
            initial={{ y: '100%' }}
            animate={isInView ? { y: 0 } : {}}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
              delay: delay + idx * 0.03
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Component>
  );
};
