import { cn } from '@/utils/ui';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const badgeVariants = cva(
  'inline-flex items-center [&>svg]:shrink-0 gap-1 h-fit border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        neutral: 'border-neutral-100 bg-neutral-100 text-neutral-500',
        destructive: 'border-transparent bg-destructive/10 text-destructive',
        success: 'border-transparent bg-success/10 text-success',
        warning: 'border-transparent bg-warning/10 text-warning',
        soft: 'bg-neutral-alpha-200 text-foreground-500 border-transparent',
        outline: 'border-neutral-alpha-200 bg-transparent font-normal text-foreground-600 shadow-sm',
      },
      kind: {
        default: 'rounded-md px-2 py-1',
        pill: 'rounded-full px-2',
        'pill-stroke': 'rounded-full px-2',
        tag: 'rounded-md py-0.5 px-2',
      },
      size: {
        default: 'text-xs',
        '2xs': 'text-[10px] leading-[14px] font-medium',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      kind: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

function Badge({ className, variant, kind, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, kind, size }), className)} {...props} />;
}

export { Badge };
