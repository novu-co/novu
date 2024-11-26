import { PageMeta } from '@/components/page-meta';
import OrganizationCreate from '../components/auth/create-organization';

export const OrganizationListPage = () => {
  return (
    <>
      <PageMeta title="Select or create organization" />

      <OrganizationCreate />
    </>
  );
};
