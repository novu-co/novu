import { DashboardLayout } from '@/components/dashboard-layout';
import { ActivityTable } from '@/components/activity/activity-table';
import { ActivityFilters, defaultActivityFilters } from '@/components/activity/activity-filters';
import { motion, AnimatePresence } from 'motion/react';
import { ActivityPanel } from '@/components/activity/activity-panel';
import { Badge } from '../components/primitives/badge';
import { PageMeta } from '../components/page-meta';
import { useActivityUrlState } from '@/hooks/use-activity-url-state';
import { useDebounce } from '@/hooks/use-debounce';
import { useSearchParams } from 'react-router-dom';

export function ActivityFeed() {
  const [searchParams, setSearchParams] = useSearchParams();

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

  const handleActivityPanelSelect = (activityId: string) => {
    setSearchParams((prev) => {
      prev.set('activityItemId', activityId);

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
          <ActivityFilters
            onFiltersChange={handleFiltersChange}
            initialValues={filterValues}
            onReset={handleClearFilters}
          />

          <motion.div
            layout
            transition={{
              duration: 0.2,
              ease: [0.32, 0.72, 0, 1],
            }}
            className="h-full flex-1"
            style={{
              width: activityItemId ? '65%' : '100%',
            }}
          >
            <ActivityTable
              selectedActivityId={activityItemId}
              onActivitySelect={handleActivitySelect}
              filters={filters}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={handleClearFilters}
            />
          </motion.div>

          <AnimatePresence mode="wait">
            {activityItemId && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.2,
                }}
                className="bg-background h-full w-[35%] overflow-auto border-l"
              >
                <ActivityPanel activityId={activityItemId} onActivitySelect={handleActivityPanelSelect} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DashboardLayout>
    </>
  );
}
