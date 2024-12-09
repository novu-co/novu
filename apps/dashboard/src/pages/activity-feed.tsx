import { DashboardLayout } from '@/components/dashboard-layout';
import { ActivityTable } from '@/components/activity/activity-table';
import { ActivityFilters } from '@/components/activity/activity-filters';
import { Badge } from '../components/primitives/badge';
import { PageMeta } from '../components/page-meta';
import { useActivityUrlState } from '@/hooks/use-activity-url-state';
import { useDebounce } from '@/hooks/use-debounce';

export function ActivityFeed() {
  const {
    activityItemId,
    filters,
    filterValues,
    handleActivitySelect,
    handleFiltersChange: handleFiltersChangeRaw,
  } = useActivityUrlState();

  const handleFiltersChange = useDebounce(handleFiltersChangeRaw, 500);

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
        <ActivityFilters onFiltersChange={handleFiltersChange} initialValues={filterValues} />
        <div className="relative flex h-[calc(100vh)]">
          <ActivityTable
            selectedActivityId={activityItemId}
            onActivitySelect={handleActivitySelect}
            filters={filters}
          />
        </div>
      </DashboardLayout>
    </>
  );
}
