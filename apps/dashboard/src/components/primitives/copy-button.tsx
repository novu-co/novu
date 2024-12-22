import { HoverToCopy } from '@/components/primitives/hover-to-copy';
import { cn } from '@/utils/ui';
import { RiFileCopyLine } from 'react-icons/ri';
import { LegacyButton, ButtonProps } from './legacy-button';

type CopyButtonProps = ButtonProps & {
  valueToCopy: string;
};

export const CopyButton = (props: CopyButtonProps) => {
  const { className, valueToCopy, children, ...rest } = props;

  return (
    <HoverToCopy asChild valueToCopy={valueToCopy}>
      <LegacyButton variant="outline" className={cn('flex items-center gap-1', className)} {...rest}>
        {children || <RiFileCopyLine className="size-4" />}
      </LegacyButton>
    </HoverToCopy>
  );
};
