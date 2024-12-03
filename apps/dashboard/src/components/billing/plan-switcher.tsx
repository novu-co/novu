import { Tabs, TabsList, TabsTrigger } from '@/components/primitives/tabs';
import { cn } from '../../utils/ui';

interface PlanSwitcherProps {
  selectedBillingInterval: 'month' | 'year';
  setSelectedBillingInterval: (value: 'month' | 'year') => void;
}

export function PlanSwitcher({ selectedBillingInterval, setSelectedBillingInterval }: PlanSwitcherProps) {
  return (
    <div className="border-border/20 relative flex h-10 items-end justify-between self-stretch border-none">
      <div className="flex flex-1 justify-start">
        <Tabs
          value={selectedBillingInterval}
          onValueChange={(value) => setSelectedBillingInterval(value as 'month' | 'year')}
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
