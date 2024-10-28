import { EnvironmentWithUserObjectCommand } from '@novu/application-generic';
import { CreateWorkflowDto, IdentifierOrInternalId, UpdateWorkflowDto } from '@novu/shared';
import { IsDefined, IsOptional, IsString } from 'class-validator';

export class UpsertWorkflowCommand extends EnvironmentWithUserObjectCommand {
  @IsOptional()
  @IsString()
  identifierOrInternalId?: IdentifierOrInternalId;

  @IsDefined()
  workflowDto: CreateWorkflowDto | UpdateWorkflowDto;
}
