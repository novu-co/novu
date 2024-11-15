import { EnvironmentWithUserObjectCommand } from '@novu/application-generic';
import { NotificationTemplateEntity } from '@novu/dal/src';

export class OverloadContentDataOnWorkflowCommand extends EnvironmentWithUserObjectCommand {
  workflow: NotificationTemplateEntity;
}
