import { Route } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { RiPlayCircleLine } from 'react-icons/ri';
import { type Activity } from '@/hooks/use-activities';
import { ActivityJobItem } from './activity-job-item';

function LogsSection({ jobs }: { jobs: Activity['jobs'] }): JSX.Element {
  return (
    <div className="flex flex-col gap-6 bg-white p-3">
      {jobs.map((job, index) => (
        <ActivityJobItem key={job._id} job={job} isLast={index === jobs.length - 1} />
      ))}
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

interface ActivityPanelProps {
  activity: Activity;
}

export function ActivityPanel({ activity }: ActivityPanelProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
      <div>
        <div className="flex items-center gap-2 border-b border-t border-neutral-200 border-b-neutral-100 p-2">
          <Route className="h-3 w-3" />
          <span className="text-foreground-950 text-sm font-medium">
            {activity.template?.name || 'Deleted workflow'}
          </span>
        </div>
        <Overview activity={activity} />

        <div className="flex items-center gap-2 border-b border-t border-neutral-100 p-2">
          <RiPlayCircleLine className="h-3 w-3" />
          <span className="text-foreground-950 text-sm font-medium">Logs</span>
        </div>
        <LogsSection jobs={activity.jobs} />
      </div>
    </motion.div>
  );
}
