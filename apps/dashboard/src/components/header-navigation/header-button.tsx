import { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../primitives/tooltip';

export const HeaderButton = ({
  children,
  label,
  disableTooltip = false,
}: {
  children: ReactNode;
  label: ReactNode;
  disableTooltip?: boolean;
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          tabIndex={0}
          className="hover:bg-foreground-100 focus-visible:ring-ring flex h-6 w-6 cursor-pointer items-center justify-center rounded-2xl transition-[background-color,box-shadow] duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2"
        >
          {children}
        </div>
      </TooltipTrigger>
      {!disableTooltip && (
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
};
