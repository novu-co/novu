import { Badge } from '@/components/primitives/badge';
import { Button } from '@/components/primitives/button';
import { ApiServiceLevelEnum } from '@novu/shared';
import { useSubscriptionContext } from './subscription-provider';
import { useSubscription } from './hooks/use-subscription';

interface PlansRowProps {
  selectedBillingInterval: 'month' | 'year';
}

interface PlanDisplayProps {
  price: string;
  subtitle: string;
  events: string;
}

function PlanDisplay({ price, subtitle, events }: PlanDisplayProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold">{price}</span>
        <span className="text-muted-foreground text-sm">{subtitle}</span>
      </div>
      <span className="text-muted-foreground text-sm">{events}</span>
    </div>
  );
}

export function PlansRow({ selectedBillingInterval }: PlansRowProps) {
  const { data: subscription } = useSubscription();
  const { apiServiceLevel } = subscription || {};
  const businessPlanPrice = selectedBillingInterval === 'year' ? '$2,700' : '$250';

  return (
    <div className="divide-border grid grid-cols-4 divide-x">
      <div className="space-y-4 p-6">
        <h3 className="text-muted-foreground text-base font-semibold">Plans</h3>
      </div>

      <div className="space-y-4 p-6">
        <h3 className="text-base font-semibold">Free</h3>
        <PlanDisplay price="$0" subtitle="free forever" events="30,000 events per month" />
      </div>

      <div className="space-y-4 p-6">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold">Business</h3>
          <Badge variant="secondary">Popular</Badge>
        </div>
        <PlanDisplay
          price={businessPlanPrice}
          subtitle={`billed ${selectedBillingInterval === 'year' ? 'annually' : 'monthly'}`}
          events="250,000 events per month"
        />
        <Button
          variant="default"
          className="w-full"
          onClick={() => {
            // TODO: Implement checkout
            window.location.href = '/v1/billing/checkout-session';
          }}
        >
          {apiServiceLevel === ApiServiceLevelEnum.BUSINESS && !subscription?.trial?.isActive
            ? 'Manage subscription'
            : 'Upgrade plan'}
        </Button>
      </div>

      <div className="flex flex-col justify-between p-6">
        <div>
          <h3 className="text-base font-semibold">Enterprise</h3>
          <p className="text-muted-foreground mt-4 text-sm">Custom pricing, billing, and extended services.</p>
        </div>
        <Button variant="outline" className="w-full">
          Contact sales
        </Button>
      </div>
    </div>
  );
}
