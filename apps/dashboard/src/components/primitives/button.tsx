import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/ui';

export const buttonVariants = cva(
  `relative isolate inline-flex items-center justify-center whitespace-nowrap rounded-lg gap-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50`,
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-b from-neutral-alpha-900 to-neutral-900 text-neutral-foreground [clip-path:border-box] shadow-[inset_0_-4px_2px_-2px_hsl(var(--neutral-900)),inset_0_0_0_1px_rgba(255,255,255,0.16),0_0_0_1px_hsl(var(--neutral-900)),0px_1px_2px_0px_#0E121B3D] after:content-[""] after:absolute after:w-full after:h-full after:bg-gradient-to-b after:from-background/10 after:opacity-0 hover:after:opacity-100 after:rounded-lg after:transition-opacity after:duration-300',
        primary:
          'bg-gradient-to-b from-primary/90 to-primary text-primary-foreground [clip-path:border-box] shadow-[inset_0_-4px_2px_-2px_hsl(var(--primary)),inset_0_0_0_1px_rgba(255,255,255,0.16),0_0_0_1px_hsl(var(--primary)),0px_1px_2px_0px_#0E121B3D] after:content-[""] after:absolute after:w-full after:h-full after:bg-gradient-to-b after:from-background/10 after:opacity-0 hover:after:opacity-100 after:rounded-lg after:transition-opacity after:duration-300',
        destructive:
          'bg-gradient-to-b from-destructive/90 to-destructive text-destructive-foreground [clip-path:border-box] shadow-[inset_0_-4px_2px_-2px_hsl(var(--destructive)),inset_0_0_0_1px_rgba(255,255,255,0.16),0_0_0_1px_hsl(var(--destructive)),0px_1px_2px_0px_#0E121B3D] after:content-[""] after:absolute after:w-full after:h-full after:bg-gradient-to-b after:from-background/10 after:opacity-0 hover:after:opacity-100 after:rounded-lg after:transition-opacity after:duration-300',
        outline:
          'border border-input text-foreground-600 bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',
        dashed: 'border border-dashed border-input bg-background hover:bg-accent text-foreground-600',
        ghost: 'hover:bg-accent',
        ghostDestructive: 'hover:bg-destructive/10 text-destructive',
        link: 'underline-offset-4 hover:underline',
        light:
          'bg-destructive/10 hover:bg-background hover:border hover:border-destructive text-destructive focus-visible:ring-destructive/10 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:bg-background focus-visible:border focus-visible:border-destructive',
      },
      size: {
        default: 'h-9 p-2.5',
        xs: 'h-6 px-1.5 rounded-md text-xs',
        sm: 'h-8 px-1.5 rounded-md text-xs',
        lg: 'h-10 rounded-md px-8',
        'input-right': 'rounded-none border-b-0 h-full text-xs border-r-0 border-t-0 px-2 py-0',
        icon: 'size-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

export { Button };
