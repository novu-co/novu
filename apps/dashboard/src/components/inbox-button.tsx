import { Popover, PopoverContent, PopoverTrigger, PopoverPortal } from '@/components/primitives/popover';
import { APP_ID } from '@/config';
import { useUser } from '@clerk/clerk-react';
import { Bell, Inbox, InboxContent } from '@novu/react';

export const InboxButton = () => {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  return (
    <Inbox subscriberId={user.externalId ?? ''} applicationIdentifier={APP_ID}>
      <Popover>
        <PopoverTrigger>
          <Bell />
        </PopoverTrigger>
        <PopoverPortal>
          <PopoverContent
            side="bottom"
            align="end"
            className="h-[500px] w-[350px] overflow-y-auto p-0 [&>div:first-child]:[&>div:first-child]:h-full [&>div:first-child]:h-full"
          >
            <InboxContent />
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    </Inbox>
  );
};
