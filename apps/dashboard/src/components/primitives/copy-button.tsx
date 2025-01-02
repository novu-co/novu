import { HoverToCopy } from '@/components/primitives/hover-to-copy';
import { cn } from '@/utils/ui';
import { RiFileCopyLine } from 'react-icons/ri';
import { Button, ButtonProps } from './button';

type CopyButtonProps = ButtonProps & {
  valueToCopy: string;
};

export const CopyButton = (props: CopyButtonProps) => {
  const { className, valueToCopy, children, size, ...rest } = props;

  return (
    <HoverToCopy asChild valueToCopy={valueToCopy}>
      <Button
        mode="outline"
        variant="secondary"
        className={cn(
          'rounded-none bg-transparent outline-none ring-1 ring-inset ring-transparent transition duration-200 ease-out',
          'hover:bg-bg-weak-50 hover:text-text-strong-950',
          'focus-visible:bg-bg-weak-50 focus-visible:text-text-strong-950 focus-visible:ring-transparent',
          className
        )}
        size={size || 'sm'}
        {...rest}
      >
        {children || <RiFileCopyLine className="size-4" />}
      </Button>
    </HoverToCopy>
  );
};
