import { formatDistanceToNow } from 'date-fns';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './primitives/hover-card';

interface TimeDisplayHoverCardProps {
  date: Date;
  children?: React.ReactNode;
  className?: string;
}

export function TimeDisplayHoverCard({ date, children, className }: TimeDisplayHoverCardProps) {
  const dateConfig: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };

  const dateTimeFormat = new Intl.DateTimeFormat('default', dateConfig);

  const utcFormat = new Intl.DateTimeFormat('default', {
    ...dateConfig,
    timeZone: 'UTC',
  });

  const utcTime = utcFormat.format(date);
  const localTime = dateTimeFormat.format(date);
  const timeAgo = formatDistanceToNow(date, { addSuffix: true });

  return (
    <HoverCard openDelay={100} closeDelay={100}>
      <HoverCardTrigger asChild className="hover:cursor-default">
        <span className={className}>{children}</span>
      </HoverCardTrigger>
      <HoverCardContent className="w-fit" align="end" sideOffset={4}>
        <div className="flex flex-col gap-2">
          <div className="text-muted-foreground text-2xs font-medium uppercase">Time Details</div>
          <div className="flex flex-col gap-2 text-xs">
            <div className="bg-muted/40 hover:bg-muted flex items-center justify-between gap-4 rounded-sm transition-colors">
              <span className="text-muted-foreground">UTC</span>
              <span className="font-medium">{utcTime}</span>
            </div>
            <div className="bg-muted/40 hover:bg-muted flex items-center justify-between gap-4 rounded-sm transition-colors">
              <span className="text-muted-foreground">Local</span>
              <span className="font-medium">{localTime}</span>
            </div>
            <div className="bg-muted/40 hover:bg-muted flex items-center justify-between gap-4 rounded-sm transition-colors">
              <span className="text-muted-foreground">Relative</span>
              <span className="font-medium">{timeAgo}</span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
