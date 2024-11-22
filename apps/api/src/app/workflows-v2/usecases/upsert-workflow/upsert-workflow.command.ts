import { EnvironmentWithUserObjectCommand } from '@novu/application-generic';
import { type CreateWorkflowDto, type IdentifierOrInternalId, type UpdateWorkflowDto } from '@novu/shared';

export class UpsertWorkflowCommand extends EnvironmentWithUserObjectCommand {
  identifierOrInternalId?: IdentifierOrInternalId;

  workflowDto: CreateWorkflowDto | UpdateWorkflowDto;
}
