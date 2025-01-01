import { ButtonDeprecated } from '../../../button-deprecated';
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

export function ClearButton({ onClick, size, label = 'Clear filter', className }: ClearButtonProps) {
  return (
    <ButtonDeprecated
      variant="ghost"
      onClick={onClick}
      className={cn(STYLES.clearButton, STYLES.size[size].input, className)}
    >
      {label}
    </ButtonDeprecated>
  );
}
