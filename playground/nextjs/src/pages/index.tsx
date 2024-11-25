import { Inbox } from '@novu/nextjs';
import Title from '@/components/Title';
import { novuConfig } from '@/utils/config';

export default function Home() {
  return (
    <>
      <Title title="Default Inbox" />
      <Inbox
        {...novuConfig}
        localization={{
          'notifications.newNotifications': ({ notificationCount }) => `${notificationCount} new notifications`,
          dynamic: {
            '6697c185607852e9104daf33': 'My workflow in other language', // key is workflow id
          },
        }}
        placement="left-start"
        placementOffset={25}
      />
    </>
  );
}
