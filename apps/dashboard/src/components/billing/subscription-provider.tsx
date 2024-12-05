import { createContext, useContext } from 'react';
import { useSubscription, type UseSubscriptionType } from './hooks/use-subscription';

const SubscriptionContext = createContext<UseSubscriptionType>({
  isLoading: false,
  data: null,
});

export const useSubscriptionContext = () => useContext(SubscriptionContext);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const props = useSubscription();

  return <SubscriptionContext.Provider value={props}>{children}</SubscriptionContext.Provider>;
}
