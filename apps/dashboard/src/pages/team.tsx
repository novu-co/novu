import { TeamManagement } from '@/components/team/team-management';
import { DashboardLayout } from '../components/dashboard-layout';
import { PageMeta } from '../components/page-meta';

export default function TeamPage() {
  return (
    <>
      <PageMeta title="Team" />
      <DashboardLayout headerStartItems={<h1 className="text-foreground-950">Team</h1>}>
        <div className="container mx-auto py-6">
          <div className="flex flex-col gap-6">
            <TeamManagement />
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
