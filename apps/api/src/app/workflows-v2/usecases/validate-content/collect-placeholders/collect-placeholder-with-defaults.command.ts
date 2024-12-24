import { BaseCommand } from '@novu/application-generic';

export class CollectPlaceholderWithDefaultsCommand extends BaseCommand {
  controlValues?: Record<string, unknown>;
}
