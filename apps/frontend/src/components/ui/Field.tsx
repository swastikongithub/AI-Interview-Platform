import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

const controlBase =
  'w-full rounded-sm bg-surface text-fg shadow-hairline placeholder:text-fg-muted ' +
  'transition-[box-shadow,background-color] duration-quick ease-out ' +
  'hover:shadow-[0_0_0_1px_rgb(var(--c-edge-strong))] ' +
  'focus:outline-none focus-visible:outline-none focus:shadow-[0_0_0_2px_rgb(var(--c-focus))] ' +
  'disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-fg-muted ' +
  'aria-[invalid=true]:shadow-[0_0_0_1.5px_rgb(var(--c-negative))]';

interface FieldFrameProps {
  id: string;
  label: string;
  hint?: React.ReactNode;
  error?: string | null;
  required?: boolean;
  optional?: boolean;
  className?: string;
  labelAction?: React.ReactNode;
  children: React.ReactNode;
}

/** Label, helper text and error, wired to the control through ids. */
const FieldFrame: React.FC<FieldFrameProps> = ({
  id,
  label,
  hint,
  error,
  required,
  optional,
  className,
  labelAction,
  children,
}) => (
  <div className={cn('flex flex-col gap-1.5', className)}>
    <div className="flex items-baseline justify-between gap-3">
      <label htmlFor={id} className="text-label text-fg">
        {label}
        {required && (
          <span className="ml-0.5 text-negative" aria-hidden="true">
            *
          </span>
        )}
        {optional && <span className="ml-1.5 font-normal text-fg-muted">Optional</span>}
      </label>
      {labelAction}
    </div>
    {children}
    {error ? (
      <p id={`${id}-error`} className="flex items-start gap-1.5 text-body-sm text-negative">
        <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        <span>{error}</span>
      </p>
    ) : hint ? (
      <p id={`${id}-hint`} className="text-body-sm text-fg-muted">
        {hint}
      </p>
    ) : null}
  </div>
);

function describedBy(id: string, error?: string | null, hint?: React.ReactNode) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

type SharedProps = {
  label: string;
  hint?: React.ReactNode;
  error?: string | null;
  optional?: boolean;
  containerClassName?: string;
  labelAction?: React.ReactNode;
};

export type TextFieldProps = SharedProps & React.InputHTMLAttributes<HTMLInputElement>;

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, hint, error, optional, containerClassName, labelAction, id, className, required, ...props }, ref) => {
    const autoId = React.useId();
    const fieldId = id ?? autoId;
    return (
      <FieldFrame
        id={fieldId}
        label={label}
        hint={hint}
        error={error}
        required={required}
        optional={optional}
        className={containerClassName}
        labelAction={labelAction}
      >
        <input
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(fieldId, error, hint)}
          className={cn(controlBase, 'h-10 px-3 text-body', className)}
          {...props}
        />
      </FieldFrame>
    );
  }
);
TextField.displayName = 'TextField';

export type TextAreaFieldProps = SharedProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextAreaField = React.forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  ({ label, hint, error, optional, containerClassName, labelAction, id, className, required, ...props }, ref) => {
    const autoId = React.useId();
    const fieldId = id ?? autoId;
    return (
      <FieldFrame
        id={fieldId}
        label={label}
        hint={hint}
        error={error}
        required={required}
        optional={optional}
        className={containerClassName}
        labelAction={labelAction}
      >
        <textarea
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(fieldId, error, hint)}
          className={cn(controlBase, 'min-h-28 resize-y px-3 py-2.5 text-body', className)}
          {...props}
        />
      </FieldFrame>
    );
  }
);
TextAreaField.displayName = 'TextAreaField';

export type SelectFieldProps = SharedProps & React.SelectHTMLAttributes<HTMLSelectElement>;

export const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, hint, error, optional, containerClassName, labelAction, id, className, required, children, ...props }, ref) => {
    const autoId = React.useId();
    const fieldId = id ?? autoId;
    return (
      <FieldFrame
        id={fieldId}
        label={label}
        hint={hint}
        error={error}
        required={required}
        optional={optional}
        className={containerClassName}
        labelAction={labelAction}
      >
        <select
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(fieldId, error, hint)}
          className={cn(
            controlBase,
            'h-10 appearance-none bg-[length:16px] bg-[right_0.625rem_center] bg-no-repeat pl-3 pr-9 text-body',
            "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23636976' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")]",
            className
          )}
          {...props}
        >
          {children}
        </select>
      </FieldFrame>
    );
  }
);
SelectField.displayName = 'SelectField';
