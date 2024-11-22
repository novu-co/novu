import { EnvironmentWithSubscriber } from '../../commands';
import { type CreateExecutionDetailsCommand } from '../create-execution-details';

export class BulkCreateExecutionDetailsCommand extends EnvironmentWithSubscriber {
  details: CreateExecutionDetailsCommand[];
}
