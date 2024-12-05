import { useEffect, useState } from 'react';
import { useSegment } from '../../context/segment';
import { useSubscription } from './hooks/use-subscription';
import { ActivePlanBanner } from './active-plan-banner';
import { PlanSwitcher } from './plan-switcher';
import { PlansRow } from './plans-row';
import { HighlightsRow } from './highlights-row';
import { Features } from './features';
import { cn } from '../../utils/ui';
import { toast } from 'sonner';

export function Plan() {
  const segment = useSegment();
  const { data } = useSubscription();
  const [selectedBillingInterval, setSelectedBillingInterval] = useState<'month' | 'year'>(
    data?.billingInterval || 'month'
  );

  useEffect(() => {
    const checkoutResult = new URLSearchParams(window.location.search).get('result');

    if (checkoutResult === 'success') {
      toast.success('Payment was successful.');
    }

    if (checkoutResult === 'canceled') {
      toast.error('Payment canseledt canceled.');
    }
  }, []);

  useEffect(() => {
    segment.track('Billing Page Viewed');
  }, [segment]);

  return (
    <div className={cn('flex w-full flex-col gap-6 p-6 pt-0')}>
      <ActivePlanBanner selectedBillingInterval={selectedBillingInterval} />
      <PlanSwitcher
        selectedBillingInterval={selectedBillingInterval}
        setSelectedBillingInterval={setSelectedBillingInterval}
      />
      <PlansRow
        selectedBillingInterval={selectedBillingInterval}
        currentPlan={data?.apiServiceLevel as 'free' | 'business' | 'enterprise'}
        trial={data?.trial}
      />
      <HighlightsRow />
      <Features />
    </div>
  );
}
