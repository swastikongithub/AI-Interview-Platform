import React, { useEffect } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { ease } from './tokens';

type RevealTag = 'h1' | 'h2' | 'p' | 'span';

interface TextRevealProps {
  children: React.ReactNode;
  as?: RevealTag;
  className?: string;
  delay?: number;
  id?: string;
}

// Created once at module scope: a motion component type that changes between
// renders would remount its subtree (and drop focus) on every parent update.
const motionTags = {
  h1: motion.h1,
  h2: motion.h2,
  p: motion.p,
  span: motion.span,
};

/**
 * Masked text reveal: the text wipes upward out of a clip, used for rare,
 * deliberate moments (a page's first headline, a new interview question).
 *
 * A single 0→1 MotionValue drives both clip-path and transform. Animating the
 * clip-path *string* directly is unreliable: browsers normalise
 * `inset(a b c b)` to three values, and interpolating between strings with a
 * different number of parts never settles. Reduced motion: opacity only.
 */
export const TextReveal: React.FC<TextRevealProps> = ({ children, as = 'h1', className, delay = 0, id }) => {
  const reduce = useReducedMotion();
  const Tag = motionTags[as];
  const progress = useMotionValue(reduce ? 1 : 0);

  // Bottom inset runs 110% → -20%; negative insets keep descenders and overhangs visible.
  const clipPath = useTransform(progress, (p) => `inset(-10% -5% ${110 - 130 * p}% -5%)`);
  const transform = useTransform(progress, (p) => `translateY(${0.35 * (1 - p)}em)`);

  useEffect(() => {
    if (reduce) return;
    const controls = animate(progress, 1, { duration: 0.55, ease: ease.out, delay });
    return () => controls.stop();
  }, [progress, reduce, delay]);

  if (reduce) {
    return (
      <Tag id={id} className={className} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, delay }}>
        {children}
      </Tag>
    );
  }

  return (
    <Tag id={id} className={className} style={{ clipPath, transform }}>
      {children}
    </Tag>
  );
};
