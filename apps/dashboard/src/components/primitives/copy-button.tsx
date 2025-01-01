import { HoverToCopy } from '@/components/primitives/hover-to-copy';
import { cn } from '@/utils/ui';
import { RiFileCopyLine } from 'react-icons/ri';
import { ButtonDeprecated, ButtonProps } from './button-deprecated';

type CopyButtonProps = ButtonProps & {
  valueToCopy: string;
};

export const CopyButton = (props: CopyButtonProps) => {
  const { className, valueToCopy, children, ...rest } = props;

  return (
    <HoverToCopy asChild valueToCopy={valueToCopy}>
      <ButtonDeprecated variant="outline" className={cn('flex items-center gap-1', className)} {...rest}>
        {children || <RiFileCopyLine className="size-4" />}
      </ButtonDeprecated>
    </HoverToCopy>
  );
};
