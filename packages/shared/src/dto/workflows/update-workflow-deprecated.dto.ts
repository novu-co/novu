import { type NotificationStepDto } from './workflow.dto';
import { type NotificationTemplateCustomData } from '../../types';

/**
 * @deprecated use UpdateWorkflowDto instead
 */
export interface IUpdateWorkflowDto {
  name?: string;

  tags?: string[];

  description?: string;

  identifier?: string;

  critical?: boolean;

  steps?: NotificationStepDto[];

  notificationGroupId?: string;

  data?: NotificationTemplateCustomData;
}
