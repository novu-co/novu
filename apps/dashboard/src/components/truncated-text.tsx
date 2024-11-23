import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/primitives/tooltip';
import { cn } from '@/utils/ui';
import { Slot, SlotProps } from '@radix-ui/react-slot';
import { useCallback, useEffect, useRef, useState } from 'react';

type TruncatedTextProps = SlotProps & { asChild?: boolean };
export default function TruncatedText(props: TruncatedTextProps) {
  const { className, children, asChild, ...rest } = props;
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  const checkTruncation = useCallback(() => {
    if (textRef.current) {
      const { scrollWidth, clientWidth } = textRef.current;
      setIsTruncated(scrollWidth > clientWidth);
    }
  }, []);

  useEffect(() => {
    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [checkTruncation]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {asChild ? (
          <Slot ref={textRef} className={cn('block truncate', className)} {...rest}>
            {children}
          </Slot>
        ) : (
          <span ref={textRef} className={cn('block truncate', className)} {...rest}>
            {children}
          </span>
        )}
      </TooltipTrigger>
      {isTruncated && <TooltipContent style={{ wordBreak: 'break-all' }}>{children}</TooltipContent>}
    </Tooltip>
  );
}
