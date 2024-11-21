import { Popover, PopoverContent, PopoverTrigger, PopoverPortal } from '@/components/primitives/popover';
import { API_HOSTNAME, APP_ID, WEBSOCKET_HOSTNAME } from '@/config';
import { useUser } from '@clerk/clerk-react';
import { Bell, Inbox, InboxContent, useNovu } from '@novu/react';
import { InboxBellFilled } from './icons/inbox-bell-filled';
import { HeaderButton } from './header-navigation/header-button';
import { useState, useEffect } from 'react';

const InboxInner = () => {
  const [open, setOpen] = useState(false);
  const [jingle, setJingle] = useState(false);

  const novu = useNovu();
  useEffect(() => {
    const cleanup = novu.on('notifications.notification_received', () => {
      setJingle(true);
      const timeout = setTimeout(() => setJingle(false), 3000);

      return () => clearTimeout(timeout);
    });
    return () => cleanup();
  }, [novu]);

  return (
    <Popover onOpenChange={setOpen}>
      <PopoverTrigger tabIndex={-1}>
        <Bell
          renderBell={(unreadCount) => (
            <HeaderButton label={unreadCount ? `Inbox (${unreadCount})` : 'Inbox'} disableTooltip={open}>
              <div className="relative flex items-center justify-center">
                <InboxBellFilled
                  className={`text-foreground-600 size-4 cursor-pointer stroke-[0.5px]`}
                  bellClassName={`origin-top ${jingle ? 'animate-swing' : ''}`}
                  ringerClassName={`origin-top ${jingle ? 'animate-jingle' : ''}`}
                />
                {unreadCount > 0 && (
                  <div className="absolute right-[-4px] top-[-6px] flex h-3 w-3 items-center justify-center rounded-full border-[3px] border-[white] bg-white">
                    <span className="bg-destructive block h-1.5 w-1.5 animate-[pulse-shadow_1s_ease-in-out_infinite] rounded-full [--pulse-color:var(--destructive)] [--pulse-size:3px]"></span>
                  </div>
                )}
              </div>
            </HeaderButton>
          )}
        />
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
  );
};

export const InboxButton = () => {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  return (
    <Inbox
      subscriberId={user.externalId ?? ''}
      applicationIdentifier={APP_ID}
      backendUrl={API_HOSTNAME}
      socketUrl={WEBSOCKET_HOSTNAME}
    >
      <InboxInner />
    </Inbox>
  );
};
