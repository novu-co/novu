import { ComponentProps, useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

type HoverToCopyProps = ComponentProps<typeof TooltipTrigger> & {
  valueToCopy: string;
};

export const HoverToCopy = (props: HoverToCopyProps) => {
  const { valueToCopy, ...rest } = props;
  const [isCopied, setIsCopied] = useState(false);

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
    <Tooltip>
      <TooltipTrigger aria-label="Copy to clipboard" onClick={copyToClipboard} {...rest} />
      <TooltipContent
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
      >
        {isCopied ? 'Copied!' : 'Click to copy'}
      </TooltipContent>
    </Tooltip>
  );
};
