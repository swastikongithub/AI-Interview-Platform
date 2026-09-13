import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { useOnceInView, useReducedMotionPreference } from './hooks';

export const SectionTransition: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useOnceInView(ref, "-10%");
  const reduceMotion = useReducedMotionPreference();

  return (
    <motion.section
      ref={ref}
      className={className}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.section>
  );
};
