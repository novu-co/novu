import { BaseCommand } from '@novu/application-generic';
import { type NotificationTemplateEntity } from '@novu/dal';

export class BuildAvailableVariableSchemaCommand extends BaseCommand {
  workflow: NotificationTemplateEntity;
  stepDatabaseId: string;
}
