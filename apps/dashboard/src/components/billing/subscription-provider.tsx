import { createContext, useContext } from 'react';
import { ApiServiceLevelEnum } from '@novu/shared';
import { useSubscription, type UseSubscriptionType } from './hooks/use-subscription';

const SubscriptionContext = createContext<UseSubscriptionType>({
  isLoading: false,
  data: {
    apiServiceLevel: ApiServiceLevelEnum.FREE,
    isActive: false,
    hasPaymentMethod: false,
    status: 'trialing',
    currentPeriodStart: null,
    currentPeriodEnd: null,
    billingInterval: null,
    events: {
      current: 0,
      included: 0,
    },
    trial: {
      isActive: false,
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      daysTotal: 0,
      daysLeft: 0,
    },
  },
});

export const useSubscriptionContext = () => useContext(SubscriptionContext);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const props = useSubscription();

  return <SubscriptionContext.Provider value={props}>{children}</SubscriptionContext.Provider>;
}
