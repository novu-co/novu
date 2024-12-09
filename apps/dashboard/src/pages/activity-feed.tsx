import { DashboardLayout } from '@/components/dashboard-layout';
import { ActivityTable } from '@/components/activity/activity-table';
import { ActivityFilters } from '@/components/activity/activity-filters';
import { Badge } from '../components/primitives/badge';
import { useSearchParams } from 'react-router-dom';
import { IActivity, ChannelTypeEnum } from '@novu/shared';
import { PageMeta } from '../components/page-meta';

interface IActivityFiltersData {
  dateRange?: string;
  channels?: ChannelTypeEnum[];
  templates?: string[];
  searchTerm?: string;
}

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

  const handleFiltersChange = (filters: IActivityFiltersData) => {
    setSearchParams((prev) => {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && (typeof value === 'string' || Array.isArray(value))) {
          prev.set(key, Array.isArray(value) ? value.join(',') : value);
        } else {
          prev.delete(key);
        }
      });
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
        <ActivityFilters onFiltersChange={handleFiltersChange} />
        <div className="relative flex h-[calc(100vh-200px)]">
          <ActivityTable selectedActivityId={activityItemId} onActivitySelect={handleActivitySelect} />
        </div>
      </DashboardLayout>
    </>
  );
}
