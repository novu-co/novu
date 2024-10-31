import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from '@/utils/ui';
import { cva, VariantProps } from 'class-variance-authority';

const tabsListVariants = cva('inline-flex items-center', {
  variants: {
    variant: {
      default: 'h-9 justify-center rounded-[10px] bg-neutral-alpha-100 p-1 text-muted-foreground',
      regular: 'border-neutral-alpha-200 w-full justify-start gap-6 border-b border-t px-3.5',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type TabsListProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>;

const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, TabsListProps>(
  ({ className, variant, ...props }, ref) => (
    <TabsPrimitive.List ref={ref} className={tabsListVariants({ variant, className })} {...props} />
  )
);
TabsList.displayName = TabsPrimitive.List.displayName;

const tabsTriggerVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background transition-all text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none data-[state=active]:text-foreground disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'px-3 py-1 data-[state=active]:bg-background data-[state=active]:shadow data-[state=inactive]:text-foreground-400',
        regular:
          "text-foreground-600 data-[state=active]:after:border-primary data-[state=active]:text-foreground-950 relative py-3.5 duration-300 ease-out after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:border-b-2 after:border-b-transparent after:content-['']",
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type TabsTriggerProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> &
  VariantProps<typeof tabsTriggerVariants>;

const TabsTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, TabsTriggerProps>(
  ({ className, variant, ...props }, ref) => (
    <TabsPrimitive.Trigger ref={ref} className={tabsTriggerVariants({ variant, className })} {...props} />
  )
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const tabsContentVariants = cva('focus-visible:outline-none', {
  variants: {
    variant: {
      default: 'ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      regular: 'mt-2',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type TabsContentProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> &
  VariantProps<typeof tabsContentVariants>;

const TabsContent = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Content>, TabsContentProps>(
  ({ className, variant, ...props }, ref) => (
    <TabsPrimitive.Content ref={ref} className={tabsContentVariants({ variant, className })} {...props} />
  )
);
TabsContent.displayName = TabsPrimitive.Content.displayName;

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ className, ...props }, ref) => <TabsPrimitive.Root ref={ref} className={cn('', className)} {...props} />);
Tabs.displayName = TabsPrimitive.Root.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
