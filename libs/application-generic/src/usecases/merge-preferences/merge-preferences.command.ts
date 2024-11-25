import { PreferencesEntity } from '@novu/dal';
import { BaseCommand } from '../../commands';

export class MergePreferencesCommand extends BaseCommand {
  preferences: PreferencesEntity[];
}
