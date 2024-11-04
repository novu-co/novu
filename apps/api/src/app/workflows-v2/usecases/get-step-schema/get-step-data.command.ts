import { EnvironmentWithUserObjectCommand } from '@novu/application-generic';
import { IsNotEmpty, IsString } from 'class-validator';
import { IdentifierOrInternalId } from '@novu/shared';

export class GetStepDataCommand extends EnvironmentWithUserObjectCommand {
  @IsString()
  @IsNotEmpty()
  workflowId: IdentifierOrInternalId;

  @IsString()
  @IsNotEmpty()
  stepId: IdentifierOrInternalId;
}
