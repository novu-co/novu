import { DashboardLayout } from '@/components/dashboard-layout';
import { useActivities, type Activity } from '@/hooks/use-activities';
import { ActivityTable } from '@/components/activity/activity-table';
import { Route, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { cn } from '@/utils/ui';
import { Button } from '@/components/primitives/button';
import { Badge } from '@/components/primitives/badge';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader } from '../components/primitives/card';
import { RiCheckLine, RiPlayCircleLine } from 'react-icons/ri';

type DetailRowProps = {
  label: string;
  value: string;
  className?: string;
};

function DetailRow({ label, value, className }: DetailRowProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}

function LogStep({
  icon,
  title,
  message,
  timestamp,
  isExpandable = false,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  timestamp: string;
  isExpandable?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex items-start gap-3">
        <div className="bg-muted mt-1 rounded-full p-1.5">{icon}</div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">{title}</span>
              {isExpandable && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ChevronDown className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')} />
                </button>
              )}
            </div>
            <span className="text-muted-foreground text-xs">{timestamp}</span>
          </div>
          <p className="text-muted-foreground text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
}

const steps = [
  {
    icon: <Route className="h-3.5 w-3.5" />,
    title: 'Digest',
    message: 'Events digested for 10 minutes',
    timestamp: '05 NOV 24, 08:16',
    iconColor: 'success',
  },
  {
    icon: <Route className="h-3.5 w-3.5" />,
    title: 'In-App Step',
    message: 'Message sent successfully!',
    timestamp: '05 NOV 24, 08:16',
    iconColor: 'success',
  },
  {
    icon: <Route className="h-3.5 w-3.5" />,
    title: 'Email step',
    message: 'Message sent successfully!',
    timestamp: '05 NOV 24, 08:16',
    iconColor: 'information',
  },
];

function LogsSection(): JSX.Element {
  return (
    <div className="flex flex-col gap-6 bg-white p-3">
      {steps.map((step, index) => (
        <div key={index} className="relative flex items-center gap-4">
          {index !== steps.length - 1 && (
            <div className="absolute left-[11px] top-[50%] h-[calc(100%+24px)] w-[1px] bg-neutral-200" />
          )}

          <div className="relative flex-shrink-0">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)]">
              <div className="bg-success flex h-4 w-4 items-center justify-center rounded-full">
                <RiCheckLine className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
          </div>

          <Card className="border-1 flex-1 border-neutral-200 p-1 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between p-3">
              <div className="flex items-center gap-1.5">
                <div className={`h-5 w-5 rounded-full border border-${step.iconColor}`}>
                  <div className={`h-full w-full rounded-full text-${step.iconColor} flex items-center justify-center`}>
                    {step.icon}
                  </div>
                </div>
                <span className="text-foreground-950 text-xs">{step.title}</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="text-foreground-600 !mt-0 h-5 gap-0 p-0 leading-[12px] hover:bg-transparent"
              >
                Show more
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="rounded-lg bg-neutral-50 p-2">
              <div className="flex items-center justify-between">
                <span className="text-foreground-400 text-xs">{step.message}</span>
                <Badge variant="soft" className="bg-foreground-50 px-2 py-0.5 text-[11px] leading-3">
                  {step.timestamp}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}

function ActivityDetails({ activity }: { activity: Activity }) {
  return (
    <div>
      <div className="flex items-center gap-2 border-b border-neutral-100 p-2">
        <Route className="h-3 w-3" />
        <span className="text-foreground-950 text-sm font-medium">{activity.template?.name}</span>
      </div>
      <Overview activity={activity} />

      <div className="flex items-center gap-2 border-b border-t border-neutral-100 p-2">
        <RiPlayCircleLine className="h-3 w-3" />
        <span className="text-foreground-950 text-sm font-medium">Logs</span>
      </div>
      <LogsSection />
    </div>
  );
}

function Overview({ activity }: { activity: Activity }) {
  return (
    <div className="px-3 py-2">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-foreground-950 text-xs font-medium">Workflow Identifier</span>
          <span className="text-foreground-600 font-mono text-xs">{activity.template?.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-foreground-950 text-xs font-medium">TransactionID</span>
          <span className="text-foreground-600 font-mono text-xs">{activity.transactionId}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-foreground-950 text-xs font-medium">SubscriberID</span>
          <span className="text-foreground-600 font-mono text-xs">{activity.subscriber?.subscriberId}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-foreground-950 text-xs font-medium">Triggered at</span>
          <span className="text-foreground-600 font-mono text-xs">
            {format(new Date(activity.createdAt), 'MMM d yyyy, HH:mm:ss')} UTC
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-foreground-950 text-xs font-medium">Status</span>
          <span className="text-success font-mono text-xs">
            {activity.jobs[activity.jobs.length - 1]?.status || 'QUEUED'}
          </span>
        </div>
      </div>
    </div>
  );
}

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
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  <ActivityDetails activity={selectedActivity} />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
