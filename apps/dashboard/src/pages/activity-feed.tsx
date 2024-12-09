import { DashboardLayout } from '@/components/dashboard-layout';
import { ActivityTable } from '@/components/activity/activity-table';
import { ActivityFilters } from '@/components/activity/activity-filters';
import { Badge } from '../components/primitives/badge';
import { useSearchParams } from 'react-router-dom';
import { IActivity, ChannelTypeEnum } from '@novu/shared';
import { PageMeta } from '../components/page-meta';
import { useCallback, useMemo } from 'react';
import { IActivityFilters } from '@/api/activity';
import { useDebounce } from '@/hooks/use-debounce';

interface IActivityFiltersData {
  dateRange: string;
  channels: ChannelTypeEnum[];
  templates: string[];
  searchTerm: string;
}

const DEFAULT_DATE_RANGE = '30d';

export function ActivityFeed() {
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

  const updateSearchParams = useCallback(
    (data: IActivityFiltersData) => {
      setSearchParams((prev) => {
        // Clear existing filter params
        ['channels', 'templates', 'searchTerm', 'dateRange'].forEach((key) => prev.delete(key));

        // Set new filter params
        if (data.channels?.length) {
          prev.set('channels', data.channels.join(','));
        }
        if (data.templates?.length) {
          prev.set('templates', data.templates.join(','));
        }
        if (data.searchTerm) {
          prev.set('searchTerm', data.searchTerm);
        }
        if (data.dateRange && data.dateRange !== DEFAULT_DATE_RANGE) {
          prev.set('dateRange', data.dateRange);
        }

        return prev;
      });
    },
    [setSearchParams]
  );

  const handleFiltersChange = useDebounce(updateSearchParams, 500);

  const filters = useMemo<IActivityFilters>(() => {
    const result: IActivityFilters = {};

    const channels = searchParams.get('channels')?.split(',').filter(Boolean);
    if (channels?.length) {
      result.channels = channels as ChannelTypeEnum[];
    }

    const templates = searchParams.get('templates')?.split(',').filter(Boolean);
    if (templates?.length) {
      result.templates = templates;
    }

    const searchTerm = searchParams.get('searchTerm');
    if (searchTerm) {
      result.search = searchTerm;
    }

    const dateRange = searchParams.get('dateRange');
    if (dateRange) {
      if (dateRange === '24h') {
        result.endDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      } else if (dateRange === '7d') {
        result.endDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      } else if (dateRange === '30d') {
        result.endDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      }
    }

    return result;
  }, [searchParams]);

  const initialFilterValues = useMemo<IActivityFiltersData>(() => {
    return {
      dateRange: searchParams.get('dateRange') || DEFAULT_DATE_RANGE,
      channels: (searchParams.get('channels')?.split(',').filter(Boolean) as ChannelTypeEnum[]) || [],
      templates: searchParams.get('templates')?.split(',').filter(Boolean) || [],
      searchTerm: searchParams.get('searchTerm') || '',
    };
  }, [searchParams]);

  return (
    <>
      <PageMeta title="Activity Feed" />
      <DashboardLayout
        headerStartItems={
          <h1 className="text-foreground-950 flex items-center gap-1">
            <span>Activity Feed</span>
            <Badge kind="pill" size="2xs">
              BETA
            </Badge>
          </h1>
        }
      >
        <ActivityFilters onFiltersChange={handleFiltersChange} initialValues={initialFilterValues} />
        <div className="relative flex h-[calc(100vh)]">
          <ActivityTable
            selectedActivityId={activityItemId}
            onActivitySelect={handleActivitySelect}
            filters={filters}
          />
        </div>
      </DashboardLayout>
    </>
  );
}
