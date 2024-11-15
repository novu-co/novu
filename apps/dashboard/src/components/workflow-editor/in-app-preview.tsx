import { HTMLAttributes, useMemo } from 'react';
import { parseMarkdownIntoTokens } from '@novu/js/internal';
import { ChannelTypeEnum, GeneratePreviewResponseDto, InAppRenderOutput } from '@novu/shared';

import { InboxArrowDown } from '@/components/icons/inbox-arrow-down';
import { InboxBell } from '@/components/icons/inbox-bell';
import { InboxEllipsis } from '@/components/icons/inbox-ellipsis';
import { InboxSettings } from '@/components/icons/inbox-settings';
import { Button } from '@/components/primitives/button';
import { cn } from '@/utils/ui';
import { Skeleton } from '../primitives/skeleton';

type InAppPreviewProps = HTMLAttributes<HTMLDivElement> & {
  truncateBody?: boolean;
  data?: GeneratePreviewResponseDto;
  isLoading?: boolean;
};
export const InAppPreview = (props: InAppPreviewProps) => {
  const { className, truncateBody: truncate = false, data, isLoading, ...rest } = props;

  return (
    <div
      className={cn(
        'border-foreground-200 to-background/90 pointer-events-none relative flex h-full w-full flex-col rounded-xl rounded-b-none border border-b-0 border-dashed p-1',
        className
      )}
      {...rest}
    >
      <div className="absolute -left-0.5 bottom-0 top-0 z-10 h-full w-[calc(100%+4px)] bg-gradient-to-t from-[rgb(255,255,255)] from-5% to-95%" />
      <div className="z-20 flex h-6 items-center justify-end px-2 text-neutral-300">
        <span className="relative p-1">
          <InboxBell className="relative size-4" />
          <div className="bg-primary border-background absolute right-1 top-1 h-2 w-2 translate-y-[1px] rounded-full border border-solid" />
        </span>
      </div>
      <div className="my-0.5 w-full border-b border-b-neutral-100" />
      <div className="z-20 flex items-center justify-between px-2 text-neutral-300">
        <div className="flex items-center gap-2">
          <span className="text-xl font-medium">Inbox</span>
          <InboxArrowDown />
        </div>
        <div className="flex items-center gap-2">
          <span className="p-0.5">
            <InboxEllipsis />
          </span>
          <span className="p-0.5">
            <InboxSettings />
          </span>
        </div>
      </div>
      {isLoading && !data && (
        <div className="bg-neutral-alpha-50 z-20 mt-2 rounded-lg px-2 py-2">
          <div className="mb-2 flex items-center gap-2">
            <Skeleton className="h-5 min-w-5 rounded-full" />
            <Skeleton className="h-5 w-full" />
          </div>
          <Skeleton className="h-5 w-full" />
        </div>
      )}
      {data && data.result?.type === ChannelTypeEnum.IN_APP && (
        <div className="bg-neutral-alpha-50 z-20 mt-2 rounded-lg px-2 py-2">
          <div className="mb-2 flex items-center gap-2">
            {data.result.preview.avatar && (
              <img src={data.result.preview.avatar} alt="avatar" className="bg-background h-5 min-w-5 rounded-full" />
            )}
            {data.result.preview.subject ? (
              <Subject text={data.result.preview.subject} className={truncate ? 'truncate' : ''} />
            ) : (
              <Body text={data.result.preview.body} className={truncate ? 'truncate' : ''} />
            )}
          </div>

          {data.result.preview.subject && (
            <Body text={data.result.preview.body} className={truncate ? 'truncate' : ''} />
          )}

          {(data.result.preview.primaryAction || data.result.preview.secondaryAction) && (
            <div className="mt-3 flex items-center justify-start gap-1 overflow-hidden">
              {data.result.preview.primaryAction && (
                <Button
                  className="overflow-hidden text-xs font-medium shadow-none"
                  type="button"
                  variant="primary"
                  size="xs"
                >
                  <span className="overflow-hidden text-ellipsis">
                    {(data.result.preview as InAppRenderOutput).primaryAction?.label}
                  </span>
                </Button>
              )}
              {data.result.preview.secondaryAction && (
                <Button variant="outline" className="overflow-hidden text-xs font-medium" type="button" size="xs">
                  <span className="overflow-hidden text-ellipsis">
                    {(data.result.preview as InAppRenderOutput).secondaryAction?.label}
                  </span>
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

type MarkdownProps = Omit<HTMLAttributes<HTMLParagraphElement>, 'children'> & { children: string };
const Markdown = (props: MarkdownProps) => {
  const { children, ...rest } = props;

  const tokens = useMemo(() => parseMarkdownIntoTokens(children), [children]);

  return (
    <p {...rest}>
      {tokens.map((token, index) => {
        if (token.type === 'bold') {
          return <strong key={index}>{token.content}</strong>;
        } else {
          return <span key={index}>{token.content}</span>;
        }
      })}
    </p>
  );
};

const Subject = ({ text, className }: { text: string; className?: string }) => {
  return <Markdown className={cn('text-foreground-600 text-xs font-medium', className)}>{text}</Markdown>;
};

const Body = ({ text, className }: { text: string; className?: string }) => {
  return <Markdown className={cn('text-foreground-400 text-xs font-normal', className)}>{text}</Markdown>;
};
