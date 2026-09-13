import React, { useRef } from 'react';
import { motion, useTransform } from 'motion/react';
import { useScrollProgress, useBreakpoint, useReducedMotionPreference } from './hooks';
import { cn } from '../utils/cn';

interface ParallaxProps {
  children: React.ReactNode;
  offset?: number;
  className?: string;
}

export const Parallax: React.FC<ParallaxProps> = ({ 
  children, 
  offset = 50, 
  className 
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const scrollYProgress = useScrollProgress(ref);
  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);
  
  const isDesktop = useBreakpoint(768);
  const reduceMotion = useReducedMotionPreference();

  const shouldAnimate = isDesktop && !reduceMotion;

  return (
    <div ref={ref} className={cn('overflow-visible', className)}>
      <motion.div style={{ y: shouldAnimate ? y : 0 }}>
        {children}
      </motion.div>
    </div>
  );
};
