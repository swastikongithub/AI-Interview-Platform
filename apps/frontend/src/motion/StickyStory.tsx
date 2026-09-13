import React, { useRef } from 'react';
import { motion, useTransform } from 'motion/react';
import { useScrollProgress, useBreakpoint, useReducedMotionPreference } from './hooks';

interface StickyStoryProps {
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
}

export const StickyStory: React.FC<StickyStoryProps> = ({ children, content, className }) => {
  const isDesktop = useBreakpoint(768);
  const reduceMotion = useReducedMotionPreference();
  const ref = useRef<HTMLDivElement>(null);
  const scrollYProgress = useScrollProgress(ref, ["start start", "end end"]);

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [20, 0, 0, -20]);

  if (!isDesktop || reduceMotion) {
    return (
      <div className={className}>
        <div className="mb-8">{content}</div>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={`relative flex items-start ${className}`} style={{ minHeight: '200vh' }}>
      <div className="w-1/2 sticky top-0 h-screen flex flex-col justify-center px-8">
        <motion.div style={{ opacity, y }}>
          {content}
        </motion.div>
      </div>
      <div className="w-1/2 py-[50vh]">
        {children}
      </div>
    </div>
  );
};
