import * as React from 'react';

import { cn } from '@/utils/ui';
import { cva, VariantProps } from 'class-variance-authority';
import { useFormField } from './form/form-context';
import { AUTOCOMPLETE_PASSWORD_MANAGERS_OFF } from '../../utils/constants';

export const inputVariants = cva(
  'file:text-foreground placeholder:text-foreground-300 flex h-full w-full bg-transparent text-xs file:border-0 file:bg-transparent file:font-medium focus-visible:outline-none disabled:cursor-not-allowed'
);

const inputFieldVariants = cva(
  cn(
    // Base styles
    'text-foreground-950',
    'flex w-full flex-nowrap',
    'items-center gap-1.5',
    'rounded-md border',
    'bg-transparent',
    'transition-colors',

    // Focus states
    'focus-within:outline-none',
    'focus-visible:outline-none',
    'focus-visible:ring-2',

    // Hover state
    'hover:bg-neutral-50',

    // Disabled state
    'has-[input:disabled]:cursor-not-allowed',
    'has-[input:disabled]:text-foreground-300',
    'has-[input:disabled]:bg-neutral-alpha-100',
    'has-[input:disabled]:opacity-50',

    // Empty value state
    'has-[input[value=""]]:text-foreground-400',

    // Read-only state
    'has-[input:read-only]:text-foreground-700',
    'has-[input:read-only]:bg-neutral-alpha-100',
    'has-[input:read-only]:opacity-70',
    'has-[input:read-only]:border-neutral-alpha-200',
    'has-[.cm-content[aria-readonly=true]]:cursor-not-allowed',
    'has-[.cm-content[aria-readonly=true]]:text-foreground-700',
    'has-[.cm-content[aria-readonly=true]]:bg-neutral-alpha-100',
    'has-[.cm-content[aria-readonly=true]]:opacity-70',
    'has-[.cm-content[aria-readonly=true]]:border-neutral-alpha-200'
  ),
  {
    variants: {
      size: {
        default: 'h-9 px-2 [&>input]:py-1.5',
        fit: 'h-fit min-h-9 px-2',
      },
      state: {
        default:
          'border-neutral-alpha-200 focus-within:border-neutral-alpha-400 focus-visible:border-neutral-alpha-400',
        error: 'border-destructive',
      },
    },
    defaultVariants: {
      size: 'default',
      state: 'default',
    },
  }
);

export type InputFieldPureProps = { children: React.ReactNode; className?: string } & VariantProps<
  typeof inputFieldVariants
> &
  Omit<React.InputHTMLAttributes<HTMLDivElement>, 'size'>;

const InputFieldPure = React.forwardRef<HTMLDivElement, InputFieldPureProps>(
  ({ children, className, size, state, ...rest }, ref) => {
    return (
      <div ref={ref} className={cn(inputFieldVariants({ size, state }), className)} {...rest}>
        {children}
      </div>
    );
  }
);

InputFieldPure.displayName = 'InputFieldPure';

export type InputFieldProps = Omit<InputFieldPureProps, 'state'>;

const InputField = React.forwardRef<HTMLDivElement, InputFieldProps>(({ ...props }, ref) => {
  const { error } = useFormField();

  return <InputFieldPure ref={ref} {...props} state={error?.message ? 'error' : 'default'} />;
});

InputField.displayName = 'InputField';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      {...AUTOCOMPLETE_PASSWORD_MANAGERS_OFF}
      className={cn(inputVariants(), className)}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input, InputField, InputFieldPure };
