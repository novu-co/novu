import { BaseCommand } from '@novu/application-generic';
import { NotificationTemplateEntity } from '@novu/dal';

export class BuildAvailableVariableSchemaCommand extends BaseCommand {
  workflow: NotificationTemplateEntity;
  stepDatabaseId: string;
}
