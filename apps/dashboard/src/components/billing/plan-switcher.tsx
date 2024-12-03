import { Tabs, TabsList, TabsTrigger } from '@/components/primitives/tabs';
import { cn } from '../../utils/ui';

interface PlanSwitcherProps {
  selectedBillingInterval: 'month' | 'year';
  setSelectedBillingInterval: (value: 'month' | 'year') => void;
}

export function PlanSwitcher({ selectedBillingInterval, setSelectedBillingInterval }: PlanSwitcherProps) {
  return (
    <div className="border-border/20 relative flex h-10 items-end justify-between self-stretch border-b">
      <h2 className="absolute left-0 top-0 text-base font-semibold">All plans</h2>
      <div className="flex flex-1 justify-center">
        <Tabs
          value={selectedBillingInterval}
          onValueChange={(value: 'month' | 'year') => setSelectedBillingInterval(value)}
        >
          <TabsList className="h-auto border-none bg-transparent p-0">
            <TabsTrigger
              value="month"
              className={cn(
                'text-muted-foreground hover:text-foreground rounded-none border-b-2 border-transparent px-3 py-2.5 text-sm font-medium transition-all',
                'data-[state=active]:border-primary data-[state=active]:text-foreground'
              )}
            >
              Monthly
            </TabsTrigger>
            <TabsTrigger
              value="year"
              className={cn(
                'text-muted-foreground hover:text-foreground rounded-none border-b-2 border-transparent px-3 py-2.5 text-sm font-medium transition-all',
                'data-[state=active]:border-primary data-[state=active]:text-foreground'
              )}
            >
              Annually <span className="text-primary ml-2">10% off</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
