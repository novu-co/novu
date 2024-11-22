import { type NotificationStepDto } from './workflow.dto';
import { type IPreferenceChannels } from '../../entities/subscriber-preference';
import { type NotificationTemplateCustomData } from '../../types';

/**
 * @deprecated use CreateWorkflowDto instead
 */
export interface ICreateWorkflowDto {
  name: string;

  tags: string[];

  description?: string;

  steps: NotificationStepDto[];

  notificationGroupId: string;

  active?: boolean;

  draft?: boolean;

  critical?: boolean;

  preferenceSettings?: IPreferenceChannels;

  blueprintId?: string;

  data?: NotificationTemplateCustomData;
}
