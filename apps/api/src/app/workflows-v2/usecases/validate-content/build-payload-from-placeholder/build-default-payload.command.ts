import { BaseCommand } from '@novu/application-generic';
import { ValidatedPlaceholderAggregation } from '../validate-placeholders';

export class BuildDefaultPayloadCommand extends BaseCommand {
  placeholderAggregators: ValidatedPlaceholderAggregation[];
}
