import { cn } from '../../../../utils/ui';

export const VARIABLE_ICON_STYLES =
  'before:mr-0.5 before:h-3 before:w-3 before:min-w-3 before:bg-[url("/images/code.svg")] before:bg-contain before:bg-center before:bg-no-repeat before:content-[""]';

interface StaticVariablePillProps {
  className?: string;
  hasFilters?: boolean;
  children: React.ReactNode;
}

export function StaticVariablePill({ className, hasFilters, children }: StaticVariablePillProps) {
  return (
    <span
      className={cn(
        'border-stroke-soft bg-weak text-sub text-foreground-600 inline-flex h-4 items-center rounded-lg border px-1.5 text-xs',
        VARIABLE_ICON_STYLES,
        hasFilters && 'after:bg-feature-base after:ml-0.5 after:h-1 after:w-1 after:rounded-full after:content-[""]',
        className
      )}
    >
      {children}
    </span>
  );
}
