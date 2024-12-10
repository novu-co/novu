import { cn } from '@/utils/ui';
import { HTMLAttributes } from 'react';

type ChatTabsSectionProps = HTMLAttributes<HTMLDivElement>;
export const ChatTabsSection = (props: ChatTabsSectionProps) => {
  const { className, ...rest } = props;
  return <div className={cn('px-3 py-5', className)} {...rest} />;
};
