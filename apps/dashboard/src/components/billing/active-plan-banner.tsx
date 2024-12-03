import { Badge } from '@/components/primitives/badge';
import { Button } from '@/components/primitives/button';
import { Card } from '@/components/primitives/card';
import { Progress } from '@/components/primitives/progress';
import { useSubscriptionContext } from './subscription-provider';
import { cn } from '../../utils/ui';

interface ActivePlanBannerProps {
  selectedBillingInterval: 'month' | 'year';
}

export function ActivePlanBanner({ selectedBillingInterval }: ActivePlanBannerProps) {
  const subscription = useSubscriptionContext();
  const { trial, apiServiceLevel, events } = subscription;
  const { current: currentEvents, included: maxEvents } = events;

  const getProgressColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage > 90) return 'bg-destructive';
    if (percentage > 75) return 'bg-warning';
    return 'bg-primary';
  };

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Active Plan</h2>
      <Card>
        <div className="flex items-start justify-between p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold capitalize">{apiServiceLevel.toLowerCase()}</h3>
              {trial.isActive && (
                <>
                  <Badge variant="outline">Trial</Badge>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-warning text-lg font-semibold">{trial.daysLeft}</span>
                    <span className="text-warning text-sm">days left</span>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline gap-1">
                <span className="text-sm">
                  <span className={cn('font-semibold', getProgressColor(currentEvents, maxEvents))}>
                    {currentEvents.toLocaleString()}
                  </span>{' '}
                  events used between {new Date(subscription.currentPeriodStart || Date.now()).toLocaleDateString()} and{' '}
                  {new Date(subscription.currentPeriodEnd || Date.now()).toLocaleDateString()}.
                </span>
              </div>
              <Progress
                value={(currentEvents / maxEvents) * 100}
                className={cn('h-1', getProgressColor(currentEvents, maxEvents))}
              />
              <span className="text-muted-foreground text-xs">Updates every hour</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                // TODO: Implement subscription management
                window.location.href = '/v1/billing/portal';
              }}
            >
              {trial.isActive ? 'Upgrade plan' : 'Manage subscription'}
            </Button>
            {subscription.status === 'trialing' && trial.end && (
              <span className="text-muted-foreground text-xs">
                Trial ends on {new Date(trial.end).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
