import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { useOnceInView, useReducedMotionPreference } from './hooks';
import { cn } from '../utils/cn';

interface ImageRevealProps {
  src: string;
  alt: string;
  className?: string;
  delay?: number;
}

export const ImageReveal: React.FC<ImageRevealProps> = ({ 
  src, 
  alt, 
  className, 
  delay = 0 
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useOnceInView(ref);
  const reduceMotion = useReducedMotionPreference();

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover origin-center"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.05 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      />
      {!reduceMotion && (
        <motion.div
          className="absolute inset-0 bg-paper z-10"
          initial={{ y: 0 }}
          animate={isInView ? { y: '100%' } : {}}
          transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
        />
      )}
    </div>
  );
};
