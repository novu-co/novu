import { Copy } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/utils/ui';
import { CopyButton } from '@/components/primitives/copy-button';

interface OverviewItemProps {
  label: string;
  value?: string;
  className?: string;
  isMonospace?: boolean;
  isCopyable?: boolean;
  children?: ReactNode;
}

export function OverviewItem({
  label,
  value,
  className = '',
  isMonospace = true,
  isCopyable = false,
  children,
}: OverviewItemProps) {
  return (
    <div className={cn('group flex items-center justify-between', className)}>
      <span className="text-foreground-950 text-xs font-medium">{label}</span>
      <div className="relative flex items-center gap-2">
        {isCopyable && value && (
          <CopyButton
            valueToCopy={value}
            mode="ghost"
            size="xs"
            className="text-foreground-600 mr-0 size-3 gap-0 p-0 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Copy className="h-3 w-3" />
          </CopyButton>
        )}
        {children || <span className={cn('text-foreground-600 text-xs', isMonospace && 'font-mono')}>{value}</span>}
      </div>
    </div>
  );
}
