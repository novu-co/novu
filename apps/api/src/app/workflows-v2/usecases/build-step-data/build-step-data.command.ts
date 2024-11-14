import { EnvironmentWithUserObjectCommand } from '@novu/application-generic';
import { IsNotEmpty, IsString } from 'class-validator';
import { IdentifierOrInternalId } from '@novu/shared';

export class BuildStepDataCommand extends EnvironmentWithUserObjectCommand {
  @IsString()
  @IsNotEmpty()
  identifierOrInternalId: IdentifierOrInternalId;

  @IsString()
  @IsNotEmpty()
  stepId: IdentifierOrInternalId;
}
