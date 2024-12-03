import { useEffect, useState } from 'react';
import { useSegment } from '../../context/segment';
import { useSubscription } from './hooks/use-subscription';
import { ActivePlanBanner } from './active-plan-banner';
import { PlanSwitcher } from './plan-switcher';
import { PlansRow } from './plans-row';
import { HighlightsRow } from './highlights-row';
import { Features } from './features';
import { cn } from '../../utils/ui';
import { Skeleton } from '../primitives/skeleton';

export function Plan() {
  const segment = useSegment();
  const { isLoading, billingInterval: subscriptionBillingInterval } = useSubscription();
  const [selectedBillingInterval, setSelectedBillingInterval] = useState<'month' | 'year'>(
    subscriptionBillingInterval || 'month'
  );

  useEffect(() => {
    const checkoutResult = new URLSearchParams(window.location.search).get('result');

    if (checkoutResult === 'success') {
      // TODO: Add toast notification
      console.log('Payment was successful.');
    }

    if (checkoutResult === 'canceled') {
      // TODO: Add toast notification
      console.log('Order canceled.');
    }
  }, []);

  useEffect(() => {
    segment.track('Billing Page Viewed');
  }, [segment]);

  if (isLoading) {
    return (
      <div className={cn('flex w-full flex-col gap-6')}>
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-10 w-48 rounded-lg" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[400px] rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className={cn('flex w-full flex-col gap-6')}>
      <ActivePlanBanner selectedBillingInterval={selectedBillingInterval} />
      <PlanSwitcher
        selectedBillingInterval={selectedBillingInterval}
        setSelectedBillingInterval={setSelectedBillingInterval}
      />
      <PlansRow selectedBillingInterval={selectedBillingInterval} />
      <HighlightsRow />
      <Features />
    </div>
  );
}
