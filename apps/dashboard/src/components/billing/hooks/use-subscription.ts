import { useQuery } from '@tanstack/react-query';
import { ApiServiceLevelEnum } from '@novu/shared';
import { get } from '../../../api/api.client';

export interface UseSubscriptionType {
  isLoading: boolean;
  apiServiceLevel: ApiServiceLevelEnum;
  isActive: boolean;
  hasPaymentMethod: boolean;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  billingInterval: 'month' | 'year' | null;
  events: {
    current: number;
    included: number;
  };
  trial: {
    isActive: boolean;
    start: string;
    end: string;
    daysTotal: number;
    daysLeft: number;
  };
}

type SubscriptionResponse = Omit<UseSubscriptionType, 'isLoading'>;

export function useSubscription(): UseSubscriptionType {
  const { data, isLoading } = useQuery<SubscriptionResponse>({
    queryKey: ['subscription'],
    queryFn: () => get('/billing/subscription'),
  });

  if (isLoading || !data) {
    return {
      isLoading,
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
    };
  }

  return {
    isLoading: false,
    ...data,
  };
}
