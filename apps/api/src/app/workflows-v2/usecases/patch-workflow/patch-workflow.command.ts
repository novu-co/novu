import { EnvironmentWithUserObjectCommand } from '@novu/application-generic';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IdentifierOrInternalId, PatchWorkflowFieldEnum } from '@novu/shared';

export class PatchWorkflowCommand extends EnvironmentWithUserObjectCommand {
  @IsString()
  @IsNotEmpty()
  identifierOrInternalId: IdentifierOrInternalId;

  @IsArray()
  fieldsToUpdate: PatchWorkflowFieldEnum[];

  @IsString()
  @IsOptional()
  active?: boolean;
}
