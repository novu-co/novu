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
          className="hover:bg-foreground-100 flex h-6 w-6 cursor-pointer items-center justify-center rounded-2xl transition-[background-color,box-shadow] duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-neutral-200"
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
