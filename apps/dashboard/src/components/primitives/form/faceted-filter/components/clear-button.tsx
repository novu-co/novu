import { Button } from '../../../button';
import { Separator } from '../../../separator';
import { cn } from '../../../../../utils/ui';
import { SizeType } from '../types';
import { STYLES } from '../styles';

interface ClearButtonProps {
  onClick: () => void;
  size: SizeType;
  label?: string;
}

export function ClearButton({ onClick, size, label = 'Clear filter' }: ClearButtonProps) {
  return (
    <>
      <Separator className="my-2" />
      <Button variant="ghost" onClick={onClick} className={cn(STYLES.clearButton, STYLES.size[size].input)}>
        {label}
      </Button>
    </>
  );
}
