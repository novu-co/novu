import { DashboardLayout } from '@/components/dashboard-layout';
import { ActivityTable } from '@/components/activity/activity-table';
import { Badge } from '../components/primitives/badge';
import { useSearchParams } from 'react-router-dom';
import { IActivity } from '@novu/shared';
import { PageMeta } from '../components/page-meta';

export function ActivityFeed() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activityItemId = searchParams.get('activityItemId');

  const handleActivitySelect = (activity: IActivity) => {
    setSearchParams((prev) => {
      if (activity._id === activityItemId) {
        prev.delete('activityItemId');
      } else {
        prev.set('activityItemId', activity._id);
      }
      return prev;
    });
  };

  return (
    <>
      <PageMeta title="Activity Feed" />
      <DashboardLayout
        headerStartItems={
          <h1 className="text-foreground-950 flex items-center gap-1">
            <span>Activity Feed</span>
            <Badge kind="pill" size="2xs">
              BETA
            </Badge>
          </h1>
        }
      >
        <div className="relative mt-10 flex h-[calc(100vh-88px)]">
          <ActivityTable selectedActivityId={activityItemId} onActivitySelect={handleActivitySelect} />
        </div>
      </DashboardLayout>
    </>
  );
}
