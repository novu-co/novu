import { HTMLAttributes, ReactNode } from 'react';
import { UserProfile } from '@/components/user-profile';
import { InboxButton } from '@/components/inbox-button';
import { CustomerSupportButton } from './customer-support-button';
import { EditBridgeUrlButton } from './edit-bridge-url-button';
import { cn } from '@/utils/ui';

type HeaderNavigationProps = HTMLAttributes<HTMLDivElement> & {
  startItems?: ReactNode;
  hideBridgeUrl?: boolean;
};
export const HeaderNavigation = (props: HeaderNavigationProps) => {
  const { startItems, hideBridgeUrl = false, className, ...rest } = props;
  return (
    <div
      className={cn('bg-background flex h-12 w-full items-center justify-between border-b px-2.5 py-1.5', className)}
      {...rest}
    >
      {startItems}
      <div className="text-foreground-600 ml-auto flex items-center gap-3">
        {!hideBridgeUrl ? <EditBridgeUrlButton /> : null}
        <CustomerSupportButton />
        <InboxButton />
        <UserProfile />
      </div>
    </div>
  );
};
