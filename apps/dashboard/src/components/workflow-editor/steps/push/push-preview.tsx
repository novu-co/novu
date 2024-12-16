import { Avatar, AvatarImage } from '@/components/primitives/avatar';
import { cn } from '@/utils/ui';
import { HTMLAttributes } from 'react';
import { RiArrowDownSFill } from 'react-icons/ri';

type PushPreviewHeaderProps = HTMLAttributes<HTMLDivElement>;
export const PushPreviewHeader = (props: PushPreviewHeaderProps) => {
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

type PushPreviewSubjectProps = HTMLAttributes<HTMLHeadingElement> & {
  subject: string;
};
export const PushPreviewSubject = (props: PushPreviewSubjectProps) => {
  const { subject, className, ...rest } = props;

  return (
    <h3 className={cn('px-8 py-2', className)} {...rest}>
      {subject}
    </h3>
  );
};

type PushPreviewBodyProps = HTMLAttributes<HTMLDivElement> & {
  body: string;
};
export const PushPreviewBody = (props: PushPreviewBodyProps) => {
  const { body, className, ...rest } = props;

  return (
    <div
      className={cn('mx-auto min-h-96 w-full overflow-auto px-8 py-6', className)}
      dangerouslySetInnerHTML={{ __html: body }}
      {...rest}
    />
  );
};

type PushPreviewContentMobileProps = HTMLAttributes<HTMLDivElement>;
export const PushPreviewContentMobile = (props: PushPreviewContentMobileProps) => {
  const { className, ...rest } = props;

  return <div className={cn('bg-background max-w-sm', className)} {...rest} />;
};

type PushPreviewBodyMobileProps = HTMLAttributes<HTMLDivElement> & {
  body: string;
};
export const PushPreviewBodyMobile = (props: PushPreviewBodyMobileProps) => {
  const { body, className, ...rest } = props;

  return (
    <div
      className={cn('mx-auto min-h-96 w-full px-4', className)}
      dangerouslySetInnerHTML={{ __html: body }}
      {...rest}
    />
  );
};

type PushPreviewSubjectMobileProps = HTMLAttributes<HTMLDivElement> & {
  subject: string;
};
export const PushPreviewSubjectMobile = (props: PushPreviewSubjectMobileProps) => {
  const { subject, className, ...rest } = props;

  return (
    <div className={cn('bg-neutral-50 p-4', className)} {...rest}>
      <h3 className="line-clamp-2">{subject}</h3>
    </div>
  );
};
