import { InboxArrowDown } from '@/components/icons/inbox-arrow-down';
import { InboxBell } from '@/components/icons/inbox-bell';
import { InboxEllipsis } from '@/components/icons/inbox-ellipsis';
import { InboxSettings } from '@/components/icons/inbox-settings';
import { Button } from '@/components/primitives/button';
import { cn } from '@/utils/ui';
import { ChannelTypeEnum, GeneratePreviewResponseDto, InAppRenderOutput } from '@novu/shared';
import { HTMLAttributes, useMemo } from 'react';
import { parseMarkdownIntoTokens } from '@novu/js/internal';

type InAppPreviewProps = HTMLAttributes<HTMLDivElement> & {
  data: GeneratePreviewResponseDto;
};
export const InAppPreview = (props: InAppPreviewProps) => {
  const { className, data, ...rest } = props;

  return (
    <div
      className={cn(
        'border-foreground-200 to-background/90 pointer-events-none relative left-0 top-0 flex h-full w-full flex-col gap-2 rounded-xl border border-dashed px-2',
        className
      )}
      {...rest}
    >
      <div className="absolute -left-0.5 bottom-0 z-10 -mb-2 h-2/3 w-[calc(100%+4px)] bg-gradient-to-t from-[rgb(255,255,255)] from-5% to-95%" />
      <div className="z-20 flex h-6 items-center justify-end text-neutral-300">
        <span className="relative">
          <InboxBell className="relative size-4" />
          <div className="bg-primary absolute right-0 top-0.5 h-1.5 w-1.5 rounded-full" />
        </span>
      </div>
      <div className="z-20 flex items-center justify-between text-neutral-300">
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold">Inbox</span>
          <InboxArrowDown />
        </div>
        <div className="flex items-center gap-2">
          <InboxEllipsis />
          <InboxSettings />
        </div>
      </div>
      {data.result?.type === ChannelTypeEnum.IN_APP && (
        <div className="z-20 mb-2 p-2">
          <div className="mb-2 flex items-center gap-2">
            {data.result.preview.avatar && (
              <img src={data.result.preview.avatar as string} alt="avatar" className="h-5 w-5 rounded-full" />
            )}
            {data.result.preview.subject ? (
              <Subject text={data.result.preview.subject as string} />
            ) : (
              <Body text={data.result.preview.body} />
            )}
          </div>

          {data.result.preview.subject && <Body text={data.result.preview.body} />}

          <div className="mt-3 flex items-center justify-end gap-1">
            {data.result.preview.primaryAction && (
              <Button className="text-xs font-medium shadow-none" type="button" variant="primary">
                {(data.result.preview as InAppRenderOutput).primaryAction?.label}
              </Button>
            )}
            {data.result.preview.secondaryAction && (
              <Button variant="outline" className="text-xs font-medium" type="button">
                {(data.result.preview as InAppRenderOutput).secondaryAction?.label}
              </Button>
            )}
          </div>
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
      {tokens.map((token) => {
        if (token.type === 'bold') {
          return <strong>{token.content}</strong>;
        } else {
          return <span>{token.content}</span>;
        }
      })}
    </p>
  );
};

const Subject = ({ text }: { text: string }) => {
  return <Markdown className="text-xs font-medium text-neutral-600">{text}</Markdown>;
};

const Body = ({ text }: { text: string }) => {
  return <Markdown className="truncate text-xs text-neutral-400">{text}</Markdown>;
};
