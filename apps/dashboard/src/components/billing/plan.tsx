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
import { useTelemetry } from '../../hooks/use-telemetry';
import { TelemetryEvent } from '../../utils/telemetry';

export function Plan() {
  const segment = useSegment();
  const track = useTelemetry();
  const { data } = useSubscription();
  const [selectedBillingInterval, setSelectedBillingInterval] = useState<'month' | 'year'>(
    data?.billingInterval || 'month'
  );

  useEffect(() => {
    const checkoutResult = new URLSearchParams(window.location.search).get('result');

    if (checkoutResult === 'success') {
      toast.success('Payment was successful.');
      track(TelemetryEvent.BILLING_PAYMENT_SUCCESS, {
        billingInterval: selectedBillingInterval,
        plan: data?.apiServiceLevel,
      });
    }

    if (checkoutResult === 'canceled') {
      toast.error('Payment was canceled.');
      track(TelemetryEvent.BILLING_PAYMENT_CANCELED, {
        billingInterval: selectedBillingInterval,
        plan: data?.apiServiceLevel,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    track(TelemetryEvent.BILLING_PAGE_VIEWED, {
      currentPlan: data?.apiServiceLevel,
      billingInterval: selectedBillingInterval,
      isTrialActive: data?.trial?.isActive,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segment]);

  const handleBillingIntervalChange = (interval: 'month' | 'year') => {
    track(TelemetryEvent.BILLING_INTERVAL_CHANGED, {
      from: selectedBillingInterval,
      to: interval,
      currentPlan: data?.apiServiceLevel,
    });
    setSelectedBillingInterval(interval);
  };

  return (
    <div className={cn('flex w-full flex-col gap-6 p-6 pt-0')}>
      <ActivePlanBanner selectedBillingInterval={selectedBillingInterval} />
      <PlanSwitcher
        selectedBillingInterval={selectedBillingInterval}
        setSelectedBillingInterval={handleBillingIntervalChange}
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
