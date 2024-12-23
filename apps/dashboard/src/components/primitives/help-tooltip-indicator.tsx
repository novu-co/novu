import { RiInformation2Line } from 'react-icons/ri';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';
import { cn } from '../../utils/ui';

interface HelpTooltipIndicatorProps {
  text: string;
  className?: string;
  size?: '4' | '5';
}

export function HelpTooltipIndicator({ text, className, size = '5' }: HelpTooltipIndicatorProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn('text-foreground-400 hover:cursor inline-block', className)}>
          <RiInformation2Line className={`size-${size}`} />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{text}</TooltipContent>
    </Tooltip>
  );
}
