import React, { useRef } from 'react';
import { motion, useScroll } from 'motion/react';
import { useReducedMotionPreference } from './hooks';
import { cn } from '../utils/cn';

export const ScrollProgress: React.FC<{ className?: string }> = ({ className }) => {
  const reduceMotion = useReducedMotionPreference();
  
  // Use document scrolling
  const { scrollYProgress } = useScroll();

  if (reduceMotion) return null;

  return (
    <motion.div
      className={cn("fixed top-16 left-0 right-0 h-[2px] bg-accent z-[40] origin-left", className)}
      style={{ scaleX: scrollYProgress }}
    />
  );
};
