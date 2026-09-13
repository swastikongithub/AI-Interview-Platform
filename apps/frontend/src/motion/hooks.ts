import { useState, useEffect } from 'react';
import { useScroll, useInView, useReducedMotion } from 'motion/react';

export function useReducedMotionPreference() {
  const shouldReduceMotion = useReducedMotion();
  return shouldReduceMotion ?? false;
}

export function useBreakpoint(breakpoint: number = 768) {
  const [isAbove, setIsAbove] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= breakpoint : true
  );

  useEffect(() => {
    const handleResize = () => setIsAbove(window.innerWidth >= breakpoint);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isAbove;
}

export function useScrollProgress(ref: React.RefObject<HTMLElement | null>, offset: any = ["start end", "end start"]) {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset,
  });
  return scrollYProgress;
}

export function useOnceInView(ref: React.RefObject<HTMLElement | null>, margin: string = "-100px") {
  return useInView(ref, { once: true, margin: margin as any });
}

export function usePinnedTimeline() {
  // Fallback / Stub for GSAP integration if purely scrubbed multi-element pinned timelines are strictly needed
  return null;
}
