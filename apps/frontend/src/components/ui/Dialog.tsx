import React, { useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { transitions } from '../../motion/tokens';
import { useFocusTrap } from './useFocusTrap';
import { Button, IconButton, type ButtonVariant } from './Button';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  /** Prevents dismissal (Escape / backdrop) while an action is in flight. */
  busy?: boolean;
  className?: string;
  /** Render with the dark palette, for dialogs opened from dark surfaces. */
  night?: boolean;
}

/**
 * Modal dialog. Motion: opacity + scale(0.96 → 1), 250ms strong ease-out,
 * centered origin (modals are exempt from trigger origin). The backdrop fades
 * with it so both read as one surface. Reduced motion keeps only the fade.
 */
export const Dialog: React.FC<DialogProps> = ({ open, onClose, ...rest }) =>
  createPortal(
    <AnimatePresence>{open && <DialogPanel key="dialog" onClose={onClose} {...rest} />}</AnimatePresence>,
    document.body
  );

const DialogPanel: React.FC<Omit<DialogProps, 'open'>> = ({
  onClose,
  title,
  description,
  children,
  footer,
  busy,
  className,
  night,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const reduce = useReducedMotion();

  const requestClose = () => {
    if (!busy) onClose();
  };
  useFocusTrap(panelRef, true, requestClose);

  return (
    <div className={cn('fixed inset-0 z-overlay flex items-end justify-center p-0 text-fg sm:items-center sm:p-6', night && 'theme-night')}>
      <motion.div
        className="absolute inset-0 bg-[rgb(8_10_14/0.55)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={transitions.modal}
        onClick={requestClose}
        aria-hidden="true"
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-lg bg-surface shadow-overlay outline-none sm:max-w-lg sm:rounded-lg',
          className
        )}
        initial={reduce ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.96)' }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, transform: 'scale(1)' }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.96)' }}
        transition={transitions.modal}
      >
        <header className="flex items-start justify-between gap-4 px-5 pb-2 pt-5 sm:px-6 sm:pt-6">
          <div className="space-y-1">
            <h2 id={titleId} className="text-title-lg text-fg">
              {title}
            </h2>
            {description && (
              <div id={descId} className="text-body text-fg-secondary">
                {description}
              </div>
            )}
          </div>
          <IconButton label="Close dialog" size="sm" onClick={requestClose} disabled={busy} className="-mr-2 -mt-1">
            <X />
          </IconButton>
        </header>
        {children && <div className="overflow-y-auto px-5 py-3 sm:px-6">{children}</div>}
        {footer && (
          <footer className="flex flex-col-reverse gap-2 border-t border-edge px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            {footer}
          </footer>
        )}
      </motion.div>
    </div>
  );
};

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  confirmVariant?: ButtonVariant;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
  night?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel,
  confirmVariant = 'primary',
  loading,
  error,
  onConfirm,
  onClose,
  night,
}) => (
  <Dialog
    open={open}
    night={night}
    onClose={onClose}
    title={title}
    description={description}
    busy={loading}
    footer={
      <>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Keep as is
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm} loading={loading} data-autofocus>
          {confirmLabel}
        </Button>
      </>
    }
  >
    {error ? (
      <p role="alert" className="rounded-sm bg-negative-soft px-3 py-2 text-body-sm text-negative">
        {error}
      </p>
    ) : null}
  </Dialog>
);
