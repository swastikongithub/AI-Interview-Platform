import React from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '../utils/cn';

/**
 * Entrance-only route transition. Keyed by pathname so it replays on
 * navigation but never on re-renders inside a page (typing, refetches).
 * CSS keyframes run off the main thread, which matters while a new route is
 * fetching data. No exit animation: navigation must never wait on motion.
 */
export const RouteTransition: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className={cn('route-enter', className)}>
      {children}
    </div>
  );
};
