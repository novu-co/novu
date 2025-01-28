import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/primitives/dropdown-menu';
import { Skeleton } from '@/components/primitives/skeleton';
import { TableCell, TableRow } from '@/components/primitives/table';
import { TimeDisplayHoverCard } from '@/components/time-display-hover-card';
import TruncatedText from '@/components/truncated-text';
import { useEnvironment } from '@/context/environment/hooks';
import { formatDateSimple } from '@/utils/format-date';
import { buildRoute, ROUTES } from '@/utils/routes';
import { cn } from '@/utils/ui';
import { ISubscriberResponseDto } from '@novu/shared';
import { ComponentProps } from 'react';
import { RiFileCopyLine, RiMore2Fill, RiPulseFill } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '../primitives/avatar';
import { CompactButton } from '../primitives/button-compact';
import { CopyButton } from '../primitives/copy-button';

type SubscriberRowProps = {
  subscriber: ISubscriberResponseDto;
};

type SubscriberLinkTableCellProps = ComponentProps<typeof TableCell> & {
  subscriber: ISubscriberResponseDto;
};

const SubscriberLinkTableCell = (props: SubscriberLinkTableCellProps) => {
  const { subscriber, children, className, ...rest } = props;

  return (
    <TableCell className={cn('group-hover:bg-neutral-alpha-50 text-text-sub relative', className)} {...rest}>
      {children}
    </TableCell>
  );
};

export const SubscriberRow = ({ subscriber }: SubscriberRowProps) => {
  const { currentEnvironment } = useEnvironment();

  return (
    <TableRow key={subscriber.subscriberId} className="group relative isolate">
      <SubscriberLinkTableCell subscriber={subscriber}>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={subscriber.avatar || undefined} />
            <AvatarFallback className="bg-neutral-alpha-100">
              {subscriber.firstName?.[0] || subscriber.email?.[0] || subscriber.subscriberId[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <TruncatedText className="text-text-strong max-w-[32ch] font-medium">
              {subscriber.firstName || subscriber.email || subscriber.subscriberId}
            </TruncatedText>
            <div className="flex items-center gap-1 transition-opacity duration-200">
              <TruncatedText className="text-text-soft font-code block text-xs">
                {subscriber.subscriberId}
              </TruncatedText>
              <CopyButton
                className="z-10 flex size-2 p-0 px-1 opacity-0 group-hover:opacity-100"
                valueToCopy={subscriber.subscriberId}
                size="2xs"
                mode="ghost"
              />
            </div>
          </div>
        </div>
      </SubscriberLinkTableCell>
      <SubscriberLinkTableCell subscriber={subscriber}>{subscriber.email || '-'}</SubscriberLinkTableCell>
      <SubscriberLinkTableCell subscriber={subscriber}>{subscriber.phone || '-'}</SubscriberLinkTableCell>
      <SubscriberLinkTableCell subscriber={subscriber}>
        <TimeDisplayHoverCard date={new Date(subscriber.createdAt)}>
          {formatDateSimple(subscriber.createdAt)}
        </TimeDisplayHoverCard>
      </SubscriberLinkTableCell>
      <SubscriberLinkTableCell subscriber={subscriber}>
        <TimeDisplayHoverCard date={new Date(subscriber.updatedAt)}>
          {formatDateSimple(subscriber.updatedAt)}
        </TimeDisplayHoverCard>
      </SubscriberLinkTableCell>
      <SubscriberLinkTableCell subscriber={subscriber} className="w-1">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <CompactButton icon={RiMore2Fill} variant="ghost" className="z-10 h-8 w-8 p-0" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  navigator.clipboard.writeText(subscriber.subscriberId);
                }}
              >
                <RiFileCopyLine />
                Copy identifier
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link
                  to={
                    buildRoute(ROUTES.ACTIVITY_FEED, {
                      environmentSlug: currentEnvironment?.slug ?? '',
                    }) +
                    '?' +
                    new URLSearchParams({ subscriberId: subscriber.subscriberId }).toString()
                  }
                >
                  <RiPulseFill />
                  View activity
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SubscriberLinkTableCell>
    </TableRow>
  );
};

export const SubscriberRowSkeleton = () => {
  return (
    <TableRow className="group relative isolate">
      <TableCell className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-5 w-[20ch]" />
          <Skeleton className="h-3 w-[15ch] rounded-full" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-[6ch] rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-[8ch] rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-[7ch] rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-[14ch] rounded-full" />
      </TableCell>
      <TableCell className="w-1">
        <RiMore2Fill className="size-4 opacity-50" />
      </TableCell>
    </TableRow>
  );
};
