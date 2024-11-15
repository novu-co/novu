import { EnvironmentWithUserObjectCommand } from '@novu/application-generic';
import { NotificationTemplateEntity } from '@novu/dal';

export class OverloadContentDataOnWorkflowCommand extends EnvironmentWithUserObjectCommand {
  workflow: NotificationTemplateEntity;
}
