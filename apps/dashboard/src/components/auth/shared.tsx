import { RiArrowLeftSLine } from 'react-icons/ri';
import { cn } from '../../utils/ui';

export function StepIndicator({ step, className }: { step: number; className?: string }) {
  return (
    <div className={cn('inline-flex items-center gap-[2px] text-[#525866]', className)}>
      <RiArrowLeftSLine className="h-4 w-4" />
      <span className="font-label-x-small text-xs">{step}/3</span>
    </div>
  );
}
