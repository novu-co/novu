import { type NotificationStepDto } from '../workflows';
import { type IPreferenceChannels } from '../../entities/subscriber-preference';
import { type NotificationTemplateCustomData } from '../../types';
import { type INotificationGroup } from '../../entities/notification-group';

export interface ICreateNotificationTemplateDto {
  name: string;

  tags: string[];

  description?: string;

  steps: NotificationStepDto[];

  notificationGroupId?: string;

  notificationGroup?: INotificationGroup;

  active?: boolean;

  draft?: boolean;

  critical?: boolean;

  preferenceSettings?: IPreferenceChannels;

  blueprintId?: string;

  data?: NotificationTemplateCustomData;
}
