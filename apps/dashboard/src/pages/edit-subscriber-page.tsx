import { SubscriberDrawer } from '@/components/subscribers/subscriber-drawer';
import SubscriberTabs from '@/components/subscribers/subscriber-tabs';

export function EditSubscriberPage() {
  return (
    <SubscriberDrawer open>
      <SubscriberTabs />
    </SubscriberDrawer>
  );
}
