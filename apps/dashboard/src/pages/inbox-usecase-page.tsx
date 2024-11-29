import { AuthCard } from '../components/auth/auth-card';
import { PageMeta } from '../components/page-meta';
import { InboxPlayground } from '../components/auth/inbox-playground';

export function InboxUsecasePage() {
  return (
    <>
      <PageMeta title="Integrate with the Inbox component" />

      <AuthCard>
        <InboxPlayground />
      </AuthCard>
    </>
  );
}
