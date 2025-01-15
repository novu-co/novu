import { cn } from '@/utils/ui';
import { IEnvironment } from '@novu/shared';
import { cva } from 'class-variance-authority';
import { RiGitBranchLine } from 'react-icons/ri';

const logoVariants = cva('', {
  variants: {
    variant: {
      default: 'bg-warning/10 border-warning text-warning',
      production: 'bg-feature/10 border-feature text-feature',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface EnvironmentBranchIconProps {
  environment?: IEnvironment;
  className?: string;
  size?: 'sm' | 'md';
}

export function EnvironmentBranchIcon({ environment, className, size = 'md' }: EnvironmentBranchIconProps) {
  const hasCustomColor = !!environment?.color;
  const isProduction = environment?.name?.toLowerCase() === 'production';

  return (
    <div
      style={
        hasCustomColor
          ? {
              backgroundColor: `${environment.color}1A`,
              borderColor: environment.color,
              color: environment.color,
            }
          : undefined
      }
      className={cn(
        size === 'sm' ? 'size-5' : 'size-6',
        'rounded-[6px] border-[1px] border-solid p-1',
        hasCustomColor
          ? 'border-opacity-100 bg-opacity-10'
          : logoVariants({ variant: isProduction ? 'production' : 'default' }),
        className
      )}
    >
      <RiGitBranchLine className={size === 'sm' ? 'size-3' : 'size-4'} />
    </div>
  );
}
