import { useQuery } from '@tanstack/react-query';
import { ApiServiceLevelEnum } from '@novu/shared';
import { get } from '../../../api/api.client';
import { differenceInDays, isSameDay } from 'date-fns';
import { useMemo } from 'react';

export interface ISubscriptionData {
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

export interface UseSubscriptionType {
  isLoading: boolean;
  data: ISubscriptionData | null;
}

export function useSubscription(): UseSubscriptionType {
  const { data, isLoading } = useQuery<{ data: ISubscriptionData | null }>({
    queryKey: ['subscription'],
    queryFn: () => get('/billing/subscription'),
  });

  const enrichedData = useMemo(() => {
    if (!data?.data) return null;

    const today = new Date();
    const daysLeft = !data.data.trial.end
      ? 0
      : isSameDay(new Date(data.data.trial.end), today)
        ? 0
        : differenceInDays(new Date(data.data.trial.end), today);

    return {
      ...data.data,
      trial: {
        ...data.data.trial,
        isActive: true,
        daysLeft,
      },
    };
  }, [data?.data]);

  return {
    isLoading,
    data: enrichedData,
  };
}
