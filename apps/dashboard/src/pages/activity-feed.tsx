import { DashboardLayout } from '@/components/dashboard-layout';
import { useActivities, type Activity } from '@/hooks/use-activities';
import { ActivityTable } from '@/components/activity/activity-table';
import { cn } from '@/utils/ui';
import { motion, AnimatePresence } from 'motion/react';
import { ActivityPanel } from '@/components/activity/activity-panel';
import { useState } from 'react';

export function ActivityFeed() {
  const { activities, isLoading } = useActivities();
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2 border-t-2" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="relative flex h-[calc(100vh-4rem)]">
        <motion.div
          layout="position"
          transition={{
            layout: { duration: 0.4, ease: 'easeInOut' },
          }}
          className={cn('h-full flex-1 overflow-auto', selectedActivity ? 'w-[65%]' : 'w-full')}
        >
          <ActivityTable
            activities={activities}
            selectedActivity={selectedActivity}
            onActivitySelect={setSelectedActivity}
          />
        </motion.div>

        <AnimatePresence mode="sync">
          {selectedActivity && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '35%', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{
                duration: 0.4,
                ease: 'easeInOut',
              }}
              className="bg-background h-full overflow-hidden border-l"
            >
              <div className="w-[500px]">
                <ActivityPanel activity={selectedActivity} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
