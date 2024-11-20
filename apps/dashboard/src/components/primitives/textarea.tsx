import * as React from 'react';

import { cn } from '@/utils/ui';
import { cva, VariantProps } from 'class-variance-authority';
import { useFormField } from './form/form-context';

const textareaVariants = cva(
  'text-foreground-950 flex text-xs w-full flex-nowrap items-center min-h-[60px] gap-1.5 rounded-md border bg-transparent transition-colors focus-within:outline-none focus-visible:outline-none hover:bg-neutral-alpha-50 disabled:cursor-not-allowed disabled:opacity-50 has-[value=""]:text-foreground-400 disabled:bg-neutral-alpha-100 disabled:text-foreground-300',
  {
    variants: {
      size: {
        default: 'h-8 px-2 py-1.5',
        md: 'h-10 px-3 py-2.5',
      },
      state: {
        default:
          'border-neutral-alpha-200 focus-within:border-neutral-alpha-950 focus-visible:border-neutral-alpha-950',
        error: 'border-destructive',
      },
    },
    defaultVariants: {
      size: 'default',
      state: 'default',
    },
  }
);

export type TextareaPureProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> &
  VariantProps<typeof textareaVariants>;

const TextareaPure = React.forwardRef<HTMLTextAreaElement, TextareaPureProps>(
  ({ className, state, size, maxLength, ...props }, ref) => {
    return (
      <>
        <textarea
          className={cn(textareaVariants({ state, size }), className)}
          ref={ref}
          maxLength={maxLength}
          {...props}
        />
        {maxLength !== undefined && (
          <div className="text-foreground-400 mt-1 text-right text-xs">
            {String(props.value).length}/{maxLength}
          </div>
        )}
      </>
    );
  }
);
TextareaPure.displayName = 'TextareaPure';

export type TextareaProps = Omit<TextareaPureProps, 'state'>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ ...props }, ref) => {
  const { error } = useFormField();

  return <TextareaPure ref={ref} {...props} state={error?.message ? 'error' : 'default'} />;
});
Textarea.displayName = 'Textarea';

export { Textarea };
