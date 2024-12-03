import { Badge } from '@/components/primitives/badge';
import { Card } from '@/components/primitives/card';
import { Check } from 'lucide-react';
import { PlanActionButton } from './plan-action-button';
import { ContactSalesButton } from './contact-sales-button';

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
        <span className="text-3xl font-bold tracking-tight">{price}</span>
        <span className="text-muted-foreground text-sm font-medium">{subtitle}</span>
      </div>
      <span className="text-muted-foreground text-sm">{events}</span>
    </div>
  );
}

export function PlansRow({ selectedBillingInterval }: PlansRowProps) {
  const businessPlanPrice = selectedBillingInterval === 'year' ? '$2,700' : '$250';

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* Free Plan */}
      <Card className="hover:border-primary/50 relative overflow-hidden border transition-colors">
        <div className="flex h-full flex-col p-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Free</h3>
            <PlanDisplay price="$0" subtitle="free forever" events="30,000 events per month" />
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <Check className="text-primary h-4 w-4" />
                <span>All core features</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="text-primary h-4 w-4" />
                <span>Up to 3 team members</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="text-primary h-4 w-4" />
                <span>Community support</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Business Plan */}
      <Card className="border-primary relative overflow-hidden border-2 shadow-md">
        <div className="bg-primary absolute -right-12 top-4 rotate-45 px-12 py-1">
          <span className="text-primary-foreground text-xs font-medium">POPULAR</span>
        </div>
        <div className="flex h-full flex-col p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold">Business</h3>
              <Badge variant="soft">Most Popular</Badge>
            </div>
            <PlanDisplay
              price={businessPlanPrice}
              subtitle={`billed ${selectedBillingInterval === 'year' ? 'annually' : 'monthly'}`}
              events="250,000 events per month"
            />
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <Check className="text-primary h-4 w-4" />
                <span>Everything in Free</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="text-primary h-4 w-4" />
                <span>Up to 10 team members</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="text-primary h-4 w-4" />
                <span>Priority support</span>
              </li>
            </ul>
          </div>
          <div className="mt-6">
            <PlanActionButton selectedBillingInterval={selectedBillingInterval} className="w-full" />
          </div>
        </div>
      </Card>

      {/* Enterprise Plan */}
      <Card className="hover:border-primary/50 relative overflow-hidden border transition-colors">
        <div className="flex h-full flex-col p-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Enterprise</h3>
            <div className="space-y-1">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold">Custom pricing</span>
              </div>
              <span className="text-muted-foreground text-sm">For large-scale operations</span>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <Check className="text-primary h-4 w-4" />
                <span>Everything in Business</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="text-primary h-4 w-4" />
                <span>Unlimited team members</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="text-primary h-4 w-4" />
                <span>Custom contracts & SLA</span>
              </li>
            </ul>
          </div>
          <div className="mt-6">
            <ContactSalesButton variant="outline" className="w-full" />
          </div>
        </div>
      </Card>
    </div>
  );
}
