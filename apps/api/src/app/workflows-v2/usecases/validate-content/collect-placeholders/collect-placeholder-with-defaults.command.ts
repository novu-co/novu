import { BaseCommand } from '@novu/application-generic';
import { ControlsKeyValue } from '@novu/dal';

export class CollectPlaceholderWithDefaultsCommand extends BaseCommand {
  controlValues?: ControlsKeyValue;
}
