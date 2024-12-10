import { Badge } from '../../../badge';
import { cn } from '../../../../../utils/ui';
import { SizeType } from '../types';
import { STYLES } from '../styles';

interface FilterBadgeProps {
  content: React.ReactNode;
  size: SizeType;
  className?: string;
}

export function FilterBadge({ content, size, className }: FilterBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn('rounded-sm border-neutral-200 font-normal text-neutral-600', STYLES.size[size].badge, className)}
    >
      {content}
    </Badge>
  );
}
