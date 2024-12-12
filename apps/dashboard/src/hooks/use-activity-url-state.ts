import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';
import { IActivity, ChannelTypeEnum } from '@novu/shared';
import { ActivityFilters } from '@/api/activity';
import { ActivityFiltersData, ActivityUrlState } from '@/types/activity';

const DEFAULT_DATE_RANGE = '30d';

function parseFilters(searchParams: URLSearchParams): ActivityFilters {
  const result: ActivityFilters = {};

  const channels = searchParams.get('channels')?.split(',').filter(Boolean);
  if (channels?.length) {
    result.channels = channels as ChannelTypeEnum[];
  }

  const workflows = searchParams.get('workflows')?.split(',').filter(Boolean);
  if (workflows?.length) {
    result.workflows = workflows;
  }

  const transactionId = searchParams.get('transactionId');
  if (transactionId) {
    result.transactionId = transactionId;
  }

  const subscriberId = searchParams.get('subscriberId');
  if (subscriberId) {
    result.subscriberId = subscriberId;
  }

  const dateRange = searchParams.get('dateRange');
  result.dateRange = dateRange || DEFAULT_DATE_RANGE;

  return result;
}

function parseFilterValues(searchParams: URLSearchParams): ActivityFiltersData {
  return {
    dateRange: searchParams.get('dateRange') || DEFAULT_DATE_RANGE,
    channels: (searchParams.get('channels')?.split(',').filter(Boolean) as ChannelTypeEnum[]) || [],
    workflows: searchParams.get('workflows')?.split(',').filter(Boolean) || [],
    transactionId: searchParams.get('transactionId') || '',
    subscriberId: searchParams.get('subscriberId') || '',
  };
}

export function useActivityUrlState(): ActivityUrlState & {
  handleActivitySelect: (activity: IActivity) => void;
  handleFiltersChange: (data: ActivityFiltersData) => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();
  const activityItemId = searchParams.get('activityItemId');

  const handleActivitySelect = useCallback(
    (activity: IActivity) => {
      setSearchParams((prev) => {
        if (activity._id === activityItemId) {
          prev.delete('activityItemId');
        } else {
          prev.set('activityItemId', activity._id);
        }
        return prev;
      });
    },
    [activityItemId, setSearchParams]
  );

  const handleFiltersChange = useCallback(
    (data: ActivityFiltersData) => {
      setSearchParams((prev) => {
        ['channels', 'workflows', 'transactionId', 'subscriberId', 'dateRange'].forEach((key) => prev.delete(key));

        if (data.channels?.length) {
          prev.set('channels', data.channels.join(','));
        }
        if (data.workflows?.length) {
          prev.set('workflows', data.workflows.join(','));
        }
        if (data.transactionId) {
          prev.set('transactionId', data.transactionId);
        }
        if (data.subscriberId) {
          prev.set('subscriberId', data.subscriberId);
        }
        if (data.dateRange && data.dateRange !== DEFAULT_DATE_RANGE) {
          prev.set('dateRange', data.dateRange);
        }

        return prev;
      });
    },
    [setSearchParams]
  );

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const filterValues = useMemo(() => parseFilterValues(searchParams), [searchParams]);

  return {
    activityItemId,
    filters,
    filterValues,
    handleActivitySelect,
    handleFiltersChange,
  };
}
