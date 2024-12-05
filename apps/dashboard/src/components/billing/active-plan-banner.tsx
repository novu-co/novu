import { Badge } from '@/components/primitives/badge';
import { Card } from '@/components/primitives/card';
import { Progress } from '@/components/primitives/progress';
import { cn } from '../../utils/ui';
import { useSubscription } from './hooks/use-subscription';
import { CalendarDays } from 'lucide-react';
import { PlanActionButton } from './plan-action-button';
import { Skeleton } from '@/components/primitives/skeleton';

interface ActivePlanBannerProps {
  selectedBillingInterval: 'month' | 'year';
}

export function ActivePlanBanner({ selectedBillingInterval }: ActivePlanBannerProps) {
  const { data: subscription } = useSubscription();

  const getProgressColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage > 90) return 'text-destructive';
    if (percentage > 75) return 'text-warning';

    return '';
  };

  const getProgressBarColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage > 90) return 'bg-gradient-to-r from-red-500 to-red-400';
    if (percentage > 75) return 'bg-gradient-to-r from-amber-500 to-amber-400';

    return 'bg-gradient-to-r from-emerald-500 to-emerald-400';
  };

  const formatDate = (date: string | number) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="mt-6 flex space-y-3">
      <Card className="mx-auto w-full max-w-[500px] overflow-hidden border shadow-none">
        <div className="space-y-5 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                {!subscription ? (
                  <Skeleton className="h-7 w-24" />
                ) : (
                  <h3 className="text-lg font-semibold capitalize">{subscription.apiServiceLevel.toLowerCase()}</h3>
                )}
                {subscription?.trial.isActive && (
                  <Badge variant="outline" className="font-medium">
                    Trial
                  </Badge>
                )}
              </div>
              {subscription?.trial.isActive && (
                <div className="text-warning text-sm font-medium">
                  {subscription.trial.daysLeft} days left for trial
                </div>
              )}
            </div>

            <PlanActionButton
              selectedBillingInterval={selectedBillingInterval}
              variant="outline"
              size="sm"
              className="shrink-0"
            />
          </div>

          <div className="space-y-4">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4" />
              {!subscription ? (
                <Skeleton className="h-4 w-48" />
              ) : (
                <span>
                  {formatDate(subscription.currentPeriodStart ?? Date.now())} -{' '}
                  {formatDate(subscription.currentPeriodEnd ?? Date.now())}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                {!subscription ? (
                  <>
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-24" />
                  </>
                ) : (
                  <>
                    <div>
                      <span
                        className={cn(
                          'font-medium',
                          getProgressColor(subscription.events.current, subscription.events.included)
                        )}
                      >
                        {subscription.events.current.toLocaleString()}
                      </span>{' '}
                      <span className="text-muted-foreground">
                        of {subscription.events.included.toLocaleString()} events
                      </span>
                    </div>
                    <span className="text-muted-foreground text-xs">Updates hourly</span>
                  </>
                )}
              </div>
              {!subscription ? (
                <Skeleton className="h-1.5 w-full" />
              ) : (
                <Progress
                  value={Math.min((subscription.events.current / subscription.events.included) * 100, 100)}
                  className={cn(
                    'h-1.5 rounded-lg transition-all duration-300',
                    getProgressBarColor(subscription.events.current, subscription.events.included)
                  )}
                />
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
