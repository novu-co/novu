import { DashboardLayout } from '@/components/dashboard-layout';
import { ActivityTable } from '@/components/activity/activity-table';
import { cn } from '@/utils/ui';
import { motion, AnimatePresence } from 'motion/react';
import { ActivityPanel } from '@/components/activity/activity-panel';
import { Badge } from '../components/primitives/badge';
import { useSearchParams } from 'react-router-dom';
import { IActivity } from '@novu/shared';

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
      <div className="relative mt-10 flex h-[calc(100vh-4rem)]">
        <motion.div
          layout="position"
          transition={{
            layout: { duration: 0.4, ease: 'easeInOut' },
          }}
          className={cn('h-full flex-1 overflow-auto', activityItemId ? 'w-[65%]' : 'w-full')}
        >
          <ActivityTable selectedActivityId={activityItemId} onActivitySelect={handleActivitySelect} />
        </motion.div>

        <AnimatePresence mode="sync">
          {activityItemId && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '35%', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{
                duration: 0.4,
                ease: 'easeInOut',
              }}
              className="bg-background h-full w-[500px] overflow-auto border-l"
            >
              <ActivityPanel activityId={activityItemId} onActivitySelect={handleActivityPanelSelect} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
