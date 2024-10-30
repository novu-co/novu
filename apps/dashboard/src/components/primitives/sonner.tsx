import { Button } from '@/components/primitives/button';
import { cn } from '@/utils/ui';
import { useTheme } from 'next-themes';
import { RiArrowRightSLine, RiCloseLine, RiProgress1Line } from 'react-icons/ri';
import { Toaster as Sonner, toast } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const SmallToast = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'text-foreground-950 border-neutral-alpha-200 flex items-center gap-1 rounded-lg border px-2.5 py-2 shadow-md',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const PromoteToast = ({
  t,
  title,
  description,
  action,
}: {
  t: number | string;
  title: string;
  description: string;
  action: { label: string; onClick: () => void };
}) => {
  return (
    <div className="flex gap-3 rounded-lg border p-3.5 shadow-md">
      <RiProgress1Line className="size-6" />
      <div className="flex flex-[1_0_0] flex-col items-start gap-2.5">
        <div className="flex flex-col items-start justify-center gap-1 self-stretch">
          <div className="text-foreground-950 text-sm font-medium">{title}</div>
          <div className="text-foreground-600 text-sm">{description}</div>
        </div>
        <div className="flex items-center justify-end gap-2 self-stretch">
          <Button variant="ghost" size="sm" className="text-destructive gap-1" onClick={action.onClick}>
            {action.label}
            <RiArrowRightSLine />
          </Button>
        </div>
      </div>
      <Button variant="link" size="icon" className="size-4" type="button" onClick={() => toast.dismiss(t)}>
        <RiCloseLine size={20} opacity={0.4} />
      </Button>
    </div>
  );
};

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg text-foreground-950',
          description: 'group-[.toast]:text-foreground-600',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster, SmallToast, PromoteToast };
