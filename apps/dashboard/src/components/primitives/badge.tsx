import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/ui';

const badgeVariants = cva(
  'inline-flex items-center gap-1 h-fit border p-1 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        neutral: 'border-neutral-500 bg-neutral-500',
        feature: 'border-feature bg-feature',
        information: 'border-information bg-information',
        highlighted: 'border-highlighted bg-highlighted',
        stable: 'border-stable bg-stable',
        verified: 'border-verified bg-verified',
        destructive: 'border-transparent bg-destructive/10 text-destructive',
        success: 'border-transparent bg-success/10 text-success',
        warning: 'border-transparent bg-warning/10 text-warning',
        alert: 'border-alert bg-alert',
        soft: 'border-neutral-alpha-200 bg-neutral-alpha-200',
        outline: 'border-neutral-alpha-200 bg-transparent font-normal text-foreground-600 shadow-sm',
      },
      kind: {
        default: 'rounded-md',
        pill: 'rounded-full',
        'pill-stroke': 'rounded-full bg-transparent',
        tag: 'rounded-md py-0.5 px-2',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      kind: 'default',
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, kind, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, kind }), className)} {...props} />;
}

export { Badge };
