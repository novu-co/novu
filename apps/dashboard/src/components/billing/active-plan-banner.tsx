import { Badge } from '@/components/primitives/badge';
import { Button } from '@/components/primitives/button';
import { Card } from '@/components/primitives/card';
import { Progress } from '@/components/primitives/progress';
import { cn } from '../../utils/ui';
import { useSubscription } from './hooks/use-subscription';
import { CalendarDays, ChevronRight } from 'lucide-react';

interface ActivePlanBannerProps {
  selectedBillingInterval: 'month' | 'year';
}

export function ActivePlanBanner({ selectedBillingInterval }: ActivePlanBannerProps) {
  const { data: subscription } = useSubscription();
  const { trial, apiServiceLevel, events } = subscription || {};
  const { current: currentEvents, included: maxEvents } = events || {};

  const getProgressColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage > 90) return 'text-destructive';
    if (percentage > 75) return 'text-warning';
    return 'text-primary';
  };

  const getProgressBarColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage > 90) return 'bg-destructive';
    if (percentage > 75) return 'bg-warning';
    return 'bg-primary';
  };

  const formatDate = (date: string | number) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="mt-6 flex justify-center space-y-3">
      <Card className="w-full max-w-2xl overflow-hidden border">
        <div className="space-y-5 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold capitalize">{apiServiceLevel?.toLowerCase()}</h3>
                {trial?.isActive && (
                  <Badge variant="outline" className="font-medium">
                    Trial
                  </Badge>
                )}
              </div>
              {trial?.isActive && <div className="text-warning text-sm font-medium">{trial.daysLeft} days left</div>}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-2"
              onClick={() => {
                window.location.href = '/v1/billing/portal';
              }}
            >
              {trial?.isActive ? 'Upgrade plan' : 'Manage subscription'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4" />
              <span>
                {formatDate(subscription.currentPeriodStart || Date.now())} -{' '}
                {formatDate(subscription.currentPeriodEnd || Date.now())}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className={cn('font-medium', getProgressColor(currentEvents, maxEvents))}>
                    {currentEvents?.toLocaleString()}
                  </span>{' '}
                  <span className="text-muted-foreground">of {maxEvents?.toLocaleString()} events</span>
                </div>
                <span className="text-muted-foreground text-xs">Updates hourly</span>
              </div>
              <Progress
                value={(currentEvents / maxEvents) * 100}
                className={cn('h-1.5 rounded-lg', getProgressBarColor(currentEvents, maxEvents))}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
