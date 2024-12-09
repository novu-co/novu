import { ChannelTypeEnum } from '@novu/shared';
import { IActivityFilters } from '@/api/activity';

export interface IActivityFiltersData {
  dateRange: string;
  channels: ChannelTypeEnum[];
  templates: string[];
  transactionId: string;
  subscriberId: string;
}

export interface IActivityUrlState {
  activityItemId: string | null;
  filters: IActivityFilters;
  filterValues: IActivityFiltersData;
}
