import React, { useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { useOnceInView, useReducedMotionPreference } from './hooks';

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  className?: string;
  as?: React.ElementType;
}

export const Reveal: React.FC<RevealProps> = ({ 
  children, 
  delay = 0, 
  duration = 0.5, 
  y = 20,
  className,
  as = 'div'
}) => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useOnceInView(ref);
  const reduceMotion = useReducedMotionPreference();
  // motion.create() must not be called fresh on every render: doing so creates a new
  // component type each time, which makes React treat it as a different element and
  // fully unmount/remount this subtree (and its descendants' focus/state) on every
  // re-render of the parent - e.g. every keystroke in a form higher up the tree.
  const Component = useMemo(() => motion.create(as as any), [as]);

  return (
    <Component
      ref={ref}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </Component>
  );
};
