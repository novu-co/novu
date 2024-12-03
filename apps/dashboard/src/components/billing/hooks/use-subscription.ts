import { useQuery } from '@tanstack/react-query';
import { ApiServiceLevelEnum } from '@novu/shared';
import { get } from '../../../api/api.client';
import { differenceInDays, isSameDay } from 'date-fns';
import { useMemo } from 'react';

export interface UseSubscriptionType {
  isLoading: boolean;
  data: {
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
  };
}

type SubscriptionResponse = Omit<UseSubscriptionType, 'isLoading'>;

export function useSubscription(): UseSubscriptionType {
  const { data, isLoading } = useQuery<SubscriptionResponse>({
    queryKey: ['subscription'],
    queryFn: () => get('/billing/subscription'),
  });

  const daysLeft = useMemo(() => {
    const today = new Date();
    if (!data?.data.trial.end) return 0;

    return isSameDay(new Date(data.data.trial.end), today) ? 0 : differenceInDays(new Date(data.data.trial.end), today);
  }, [data?.data.trial.end]);

  if (isLoading || !data) {
    return {
      isLoading,
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
    };
  }

  data.data = {
    ...data.data,
    trial: {
      ...data.data.trial,
      daysLeft,
    },
  };

  return {
    isLoading: false,
    ...data,
  };
}
