import { cn } from '@/utils/ui';
import { HTMLAttributes } from 'react';

type PushTabsSectionProps = HTMLAttributes<HTMLDivElement>;
export const PushTabsSection = (props: PushTabsSectionProps) => {
  const { className, ...rest } = props;
  return <div className={cn('px-4 py-3', className)} {...rest} />;
};
