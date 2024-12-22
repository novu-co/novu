import { LegacyButton } from '../../../legacy-button';
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
    <LegacyButton
      variant="ghost"
      onClick={onClick}
      className={cn(STYLES.clearButton, STYLES.size[size].input, className)}
    >
      {label}
    </LegacyButton>
  );
}
