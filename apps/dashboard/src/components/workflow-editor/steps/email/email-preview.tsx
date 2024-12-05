import { Avatar, AvatarImage } from '@/components/primitives/avatar';
import { cn } from '@/utils/ui';
import { HTMLAttributes } from 'react';
import { RiArrowDownSFill } from 'react-icons/ri';

type EmailPreviewHeaderProps = HTMLAttributes<HTMLDivElement>;
export const EmailPreviewHeader = (props: EmailPreviewHeaderProps) => {
  const { className, ...rest } = props;
  return (
    <div className={cn('flex gap-2', className)} {...rest}>
      <Avatar className="size-8">
        <AvatarImage src="/images/building.svg" />
      </Avatar>
      <div>
        <div>
          Acme Inc. <span className="text-foreground-600 text-xs">{`<noreply@novu.co>`}</span>
        </div>
        <div className="text-foreground-600 flex items-center gap-1 text-xs">
          to me <RiArrowDownSFill />
        </div>
      </div>
    </div>
  );
};
