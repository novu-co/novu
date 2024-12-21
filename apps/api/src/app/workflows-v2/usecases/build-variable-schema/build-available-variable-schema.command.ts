import { EnvironmentWithUserCommand } from '@novu/application-generic';
import { NotificationTemplateEntity } from '@novu/dal';

export class BuildAvailableVariableSchemaCommand extends EnvironmentWithUserCommand {
  workflow: NotificationTemplateEntity | undefined;
  stepInternalId: string | undefined;
}
