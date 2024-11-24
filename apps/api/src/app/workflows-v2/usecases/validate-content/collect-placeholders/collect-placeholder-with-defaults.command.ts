import { BaseCommand } from '@novu/application-generic';
import { JSONSchemaDto, WorkflowOriginEnum } from '@novu/shared';

export class CollectPlaceholderWithDefaultsCommand extends BaseCommand {
  controlValues?: Record<string, unknown>;
  origin?: WorkflowOriginEnum;
  payloadSchema?: JSONSchemaDto;
}
