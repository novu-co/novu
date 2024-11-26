import { ReactElement } from 'react';
import { PageMeta } from '../components/page-meta';
import { DashboardLayout } from '../components/dashboard-layout';
import { ProgressSection } from '../components/welcome/progress-section';
import { ResourcesList } from '../components/welcome/resources-list';
import { RiBookletFill, RiBookmark2Fill } from 'react-icons/ri';
import { Resource } from '../components/welcome/resources-list';

const helpfulResources: Resource[] = [
  {
    title: "Let's meet? Let's chat about notifications.",
    duration: '15m meet',
    image: 'calendar_schedule.png',
    url: 'https://cal.com/novu/30min',
  },
  {
    title: 'Join our community on Discord',
    duration: '30s',
    image: 'calendar_schedule.png',
    url: 'https://discord.gg/novu',
  },
  {
    title: 'Star us on GitHub',
    duration: '10s for happiness',
    image: 'view_code.png',
    url: 'https://github.com/novuhq/novu',
  },
  {
    title: 'Security & Compliance with Novu',
    duration: '5m read',
    image: 'compliance.png',
    url: 'https://trust.novu.co/',
  },
];

export function WelcomePage(): ReactElement {
  return (
    <>
      <PageMeta title="Get Started with Novu" />
      <DashboardLayout>
        <div className="flex flex-col gap-8 p-9 pt-6">
          <ProgressSection />
          <ResourcesList
            title="Helpful resources"
            icon={<RiBookmark2Fill className="h-4 w-4" />}
            resources={helpfulResources}
          />
          <ResourcesList title="Learn" icon={<RiBookletFill className="h-4 w-4" />} resources={helpfulResources} />
        </div>
      </DashboardLayout>
    </>
  );
}
