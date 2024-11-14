import { NotificationTemplateEntity } from '@novu/dal';
import { WorkflowPreferences } from '@novu/shared';

export class GetWorkflowByIdsResponseDto extends NotificationTemplateEntity {
  userPreferences: WorkflowPreferences | null;

  defaultPreferences: WorkflowPreferences;
}
