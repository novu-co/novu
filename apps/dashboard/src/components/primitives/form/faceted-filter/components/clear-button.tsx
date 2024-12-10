import { Button } from '../../../button';
import { Separator } from '../../../separator';
import { cn } from '../../../../../utils/ui';
import { SizeType } from '../types';
import { STYLES } from '../styles';

interface ClearButtonProps {
  onClick: () => void;
  size: SizeType;
  label?: string;
  className?: string;
  separatorClassName?: string;
}

export function ClearButton({
  onClick,
  size,
  label = 'Clear filter',
  className,
  separatorClassName,
}: ClearButtonProps) {
  return (
    <>
      <Separator className={cn('my-2', separatorClassName)} />
      <Button variant="ghost" onClick={onClick} className={cn(STYLES.clearButton, STYLES.size[size].input, className)}>
        {label}
      </Button>
    </>
  );
}
