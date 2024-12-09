import { Copy } from 'lucide-react';
import { CopyButton } from '@/components/primitives/copy-button';

interface CopyableFieldProps {
  label: string;
  value: string;
  className?: string;
  isMonospace?: boolean;
}

export function CopyableField({ label, value, className = '', isMonospace = true }: CopyableFieldProps) {
  return (
    <div className={`group flex items-center justify-between ${className}`}>
      <span className="text-foreground-950 text-xs font-medium">{label}</span>
      <div className="relative flex items-center gap-2">
        <CopyButton
          valueToCopy={value}
          variant="ghost"
          size="icon"
          className="text-foreground-600 mr-0 size-3 gap-0 p-0 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <Copy className="h-3 w-3" />
        </CopyButton>
        <span className={`text-foreground-600 text-xs ${isMonospace ? 'font-mono' : ''}`}>{value}</span>
      </div>
    </div>
  );
}
