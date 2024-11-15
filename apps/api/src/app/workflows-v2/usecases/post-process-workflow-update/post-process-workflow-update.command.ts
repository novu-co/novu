import { EnvironmentWithUserObjectCommand } from '@novu/application-generic';
import { NotificationTemplateEntity } from '@novu/dal';

export class PostProcessWorkflowUpdateCommand extends EnvironmentWithUserObjectCommand {
  workflow: NotificationTemplateEntity;
}
