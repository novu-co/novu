import { DashboardLayout } from '@/components/dashboard-layout';
import { useActivities } from '@/hooks/use-activities';
import { ActivityTable } from '@/components/activity/activity-table';
import { cn } from '@/utils/ui';
import { motion, AnimatePresence } from 'motion/react';
import { ActivityPanel } from '@/components/activity/activity-panel';
import { useState } from 'react';

export function ActivityFeed() {
  const { activities, isLoading, hasMore, pageSize, offset } = useActivities();
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  return (
    <DashboardLayout>
      <div className="relative mt-10 flex h-[calc(100vh-4rem)]">
        <motion.div
          layout="position"
          transition={{
            layout: { duration: 0.4, ease: 'easeInOut' },
          }}
          className={cn('h-full flex-1 overflow-auto', selectedActivityId ? 'w-[65%]' : 'w-full')}
        >
          <ActivityTable
            hasMore={hasMore}
            isLoading={isLoading}
            activities={activities}
            selectedActivityId={selectedActivityId}
            onActivitySelect={(activity) => setSelectedActivityId(activity._id)}
          />
        </motion.div>

        <AnimatePresence mode="sync">
          {selectedActivityId && (
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
              <ActivityPanel
                activityId={selectedActivityId}
                onActivitySelect={(activityId) => setSelectedActivityId(activityId)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
