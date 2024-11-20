import { PageMeta } from '@/components/page-meta';
import { AuthCard } from '../components/auth/auth-card';
import OrganizationCreate from '../components/auth/create-organization';

export const OrganizationListPage = () => {
  return (
    <>
      <PageMeta title="Select or create organization" />

      <AuthCard>
        <OrganizationCreate />
      </AuthCard>
    </>
  );
};
