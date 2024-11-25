import { ReactElement } from 'react';
import { PageMeta } from '../components/page-meta';
import { DashboardLayout } from '../components/dashboard-layout';
import { ProgressSection } from '../components/welcome/progress-section';

export function WelcomePage(): ReactElement {
  return (
    <>
      <PageMeta title="Get Started with Novu" />
      <DashboardLayout>
        <div className="p-9 pt-6">
          <ProgressSection />
        </div>
      </DashboardLayout>
    </>
  );
}
