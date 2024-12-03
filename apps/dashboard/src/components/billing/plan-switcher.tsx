import { Tabs, TabsList, TabsTrigger } from '@/components/primitives/tabs';

interface PlanSwitcherProps {
  selectedBillingInterval: 'month' | 'year';
  setSelectedBillingInterval: (value: 'month' | 'year') => void;
}

export function PlanSwitcher({ selectedBillingInterval, setSelectedBillingInterval }: PlanSwitcherProps) {
  return (
    <div className="border-border/20 relative flex h-10 items-end justify-between self-stretch border-none">
      <div className="flex flex-1 justify-center">
        <Tabs
          value={selectedBillingInterval}
          onValueChange={(value) => setSelectedBillingInterval(value as 'month' | 'year')}
        >
          <TabsList>
            <TabsTrigger value="month">Monthly</TabsTrigger>
            <TabsTrigger value="year">
              Annually <span className="text-primary ml-2">10% off</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
