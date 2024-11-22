import { type NotificationStepDto } from '../workflows';
import { type NotificationTemplateCustomData } from '../../types';

export interface IUpdateNotificationTemplateDto {
  name?: string;

  tags?: string[];

  description?: string;

  identifier?: string;

  critical?: boolean;

  steps?: NotificationStepDto[];

  notificationGroupId?: string;

  data?: NotificationTemplateCustomData;
}
