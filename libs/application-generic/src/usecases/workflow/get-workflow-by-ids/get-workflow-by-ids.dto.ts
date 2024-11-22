import { NotificationTemplateEntity } from '@novu/dal';
import { type WorkflowPreferences } from '@novu/shared';

export class WorkflowInternalResponseDto extends NotificationTemplateEntity {
  userPreferences: WorkflowPreferences | null;

  defaultPreferences: WorkflowPreferences;
}
