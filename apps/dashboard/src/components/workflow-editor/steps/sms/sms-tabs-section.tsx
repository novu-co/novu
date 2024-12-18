import { cn } from '@/utils/ui';
import { HTMLAttributes } from 'react';

type SmsTabsSectionProps = HTMLAttributes<HTMLDivElement>;
export const SmsTabsSection = (props: SmsTabsSectionProps) => {
  const { className, ...rest } = props;
  return <div className={cn('px-4 py-3', className)} {...rest} />;
};
