import React from 'react';
import { motion } from 'motion/react';
import { useReducedMotionPreference } from './hooks';

export const PageTransition: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const reduceMotion = useReducedMotionPreference();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};
