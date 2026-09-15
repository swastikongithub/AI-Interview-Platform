import type { Transition } from 'motion/react';

/**
 * Motion tokens for Motion (JS). These mirror the CSS custom properties in
 * index.css and come from the Animate skill tables — extend, never fork.
 */
export const ease = {
  /** Entering / exiting UI. */
  out: [0.23, 1, 0.32, 1] as const,
  /** Moving or morphing something already on screen. */
  inOut: [0.77, 0, 0.175, 1] as const,
  /** iOS-like drawer / sheet. */
  drawer: [0.32, 0.72, 0, 1] as const,
};

export const duration = {
  press: 0.16,
  popover: 0.2,
  modal: 0.25,
  drawer: 0.4,
  /** Rare, deliberate moments (question change, evaluation reveal). */
  deliberate: 0.45,
};

export const transitions = {
  popover: { duration: duration.popover, ease: ease.out } satisfies Transition,
  modal: { duration: duration.modal, ease: ease.out } satisfies Transition,
  drawer: { duration: duration.drawer, ease: ease.drawer } satisfies Transition,
  move: { duration: duration.popover, ease: ease.inOut } satisfies Transition,
  deliberate: { duration: duration.deliberate, ease: ease.out } satisfies Transition,
};
