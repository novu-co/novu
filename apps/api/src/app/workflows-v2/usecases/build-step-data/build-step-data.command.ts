import { EnvironmentWithUserObjectCommand } from '@novu/application-generic';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IdentifierOrInternalId } from '@novu/shared';

export class BuildStepDataCommand extends EnvironmentWithUserObjectCommand {
  @IsString()
  @IsNotEmpty()
  workflowIdentifierOrInternalId: IdentifierOrInternalId;

  @IsString()
  @IsNotEmpty()
  stepIdOrInternalId: IdentifierOrInternalId;
}
