import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

type ToastTone = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
}

interface ToastContextValue {
  notify: (toast: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

const toneIcon: Record<ToastTone, React.ReactNode> = {
  success: <CheckCircle2 className="size-4 text-positive" aria-hidden="true" />,
  error: <AlertCircle className="size-4 text-negative" aria-hidden="true" />,
  info: <Info className="size-4 text-info" aria-hidden="true" />,
};

/**
 * Toasts enter from and exit through the bottom edge. Transition-based (not
 * keyframes) so rapid successive toasts retarget instead of restarting, with
 * `ease` at 400ms per the Animate skill's toast recipe.
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);
  const reduce = useReducedMotion();

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = ++counter.current;
      setToasts((prev) => [...prev.slice(-2), { ...toast, id }]);
      window.setTimeout(() => dismiss(id), toast.tone === 'error' ? 7000 : 4500);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div
          className="pointer-events-none fixed inset-x-0 bottom-0 z-toast flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
          aria-live="polite"
          aria-relevant="additions"
        >
          <AnimatePresence initial={false}>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                layout={!reduce}
                role={t.tone === 'error' ? 'alert' : 'status'}
                initial={reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(100%)' }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, transform: 'translateY(0%)' }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(100%)' }}
                // CSS `ease`, matching the toast recipe.
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                className={cn(
                  'theme-night pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-md bg-surface px-4 py-3 text-fg shadow-overlay'
                )}
              >
                <span className="mt-0.5">{toneIcon[t.tone]}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-title-sm">{t.title}</p>
                  {t.description && <p className="mt-0.5 text-body-sm text-fg-secondary">{t.description}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  className="pressable -mr-1 rounded-xs p-1 text-fg-muted hover:text-fg"
                  aria-label="Dismiss notification"
                >
                  <X className="size-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};
