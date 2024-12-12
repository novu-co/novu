import { DashboardLayout } from '@/components/dashboard-layout';
import { ActivityTable } from '@/components/activity/activity-table';
import { motion, AnimatePresence } from 'motion/react';
import { ActivityPanel } from '@/components/activity/activity-panel';
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
            <ActivityTable selectedActivityId={activityItemId} onActivitySelect={handleActivitySelect} />
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
