import { cn } from '@/utils/ui';
import { HTMLAttributes, useRef, useState } from 'react';
import { RiFileCopyLine } from 'react-icons/ri';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

type HoverToCopyProps = HTMLAttributes<HTMLDivElement> & {
  valueToCopy: string;
};

export const HoverToCopy = (props: HoverToCopyProps) => {
  const { valueToCopy, className, children, ...rest } = props;
  const [isCopied, setIsCopied] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const copyToClipboard = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(valueToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <div className={cn('group flex items-center gap-1', className)} {...rest}>
          <span>{children}</span>
          <TooltipTrigger ref={triggerRef} onClick={copyToClipboard} aria-label="Copy to clipboard">
            <RiFileCopyLine className="text-foreground-400 invisible size-3 group-hover:visible" />
          </TooltipTrigger>
        </div>
        <TooltipContent
          onPointerDownOutside={(e) => {
            e.preventDefault();
          }}
        >
          <p>{isCopied ? 'Copied!' : 'Click to copy'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
