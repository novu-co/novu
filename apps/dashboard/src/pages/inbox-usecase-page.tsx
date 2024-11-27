import { AuthCard } from '../components/auth/auth-card';
import { useNavigate } from 'react-router-dom';
import { PageMeta } from '../components/page-meta';
import { useTelemetry } from '../hooks';
import { InboxPreview } from '../components/auth/inbox-playground';

export function InboxUsecasePage() {
  const navigate = useNavigate();
  const track = useTelemetry();

  return (
    <>
      <PageMeta title="Integrate with the Inbox component" />

      <AuthCard>
        <InboxPreview />
      </AuthCard>
    </>
  );
}
