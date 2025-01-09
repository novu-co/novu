import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { RiCheckLine, RiFileCopyLine } from 'react-icons/ri';
import { cn } from '../../utils/ui';
import { Button, ButtonProps } from './button';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

type CopyButtonProps = ButtonProps & {
  valueToCopy: string;
  inputGroup?: boolean;
};

export const CopyButton = (props: CopyButtonProps) => {
  const { className, valueToCopy, inputGroup, children, ...rest } = props;

  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(valueToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const sizeClass = props.size === '2xs' ? 'size-3' : 'size-4';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          mode="outline"
          variant="secondary"
          className={cn(className, inputGroup && 'h-[34px] rounded-none border-l ring-0')}
          onClick={handleCopy}
          aria-label={copied ? 'Copied' : 'Copy to clipboard'}
          disabled={copied}
          {...rest}
        >
          {children}
          <div className={`relative ${sizeClass}`}>
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', duration: 0.1, bounce: 0.5 }}
                  className="absolute inset-0"
                >
                  <RiCheckLine className={`${sizeClass} text-success`} aria-hidden="true" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', duration: 0.15, bounce: 0.5 }}
                  className="absolute inset-0"
                >
                  <RiFileCopyLine className={`${sizeClass}`} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Button>
      </TooltipTrigger>
      <TooltipContent className="px-2 py-1 text-xs" sideOffset={4}>
        {copied ? 'Copied!' : 'Click to copy'}
      </TooltipContent>
    </Tooltip>
  );
};
