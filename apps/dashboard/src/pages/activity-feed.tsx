import { DashboardLayout } from '@/components/dashboard-layout';
import { ActivityTable } from '@/components/activity/activity-table';
import { ActivityFilters, defaultActivityFilters } from '@/components/activity/activity-filters';
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

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    // Ignore endDate as it's always present
    if (key === 'endDate') return false;
    // For arrays, check if they have any items
    if (Array.isArray(value)) return value.length > 0;
    // For other values, check if they exist
    return !!value;
  });

  const handleClearFilters = () => {
    handleFiltersChange(defaultActivityFilters);
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
        <ActivityFilters
          onFiltersChange={handleFiltersChange}
          initialValues={filterValues}
          onReset={handleClearFilters}
        />
        <div className="relative h-[calc(100vh)] w-full">
          <ActivityTable
            selectedActivityId={activityItemId}
            onActivitySelect={handleActivitySelect}
            filters={filters}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
          />
        </div>
      </DashboardLayout>
    </>
  );
}
