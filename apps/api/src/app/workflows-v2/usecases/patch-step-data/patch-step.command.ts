import { EnvironmentWithUserObjectCommand } from '@novu/application-generic';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IdentifierOrInternalId } from '@novu/shared';

export class PatchStepCommand extends EnvironmentWithUserObjectCommand {
  @IsString()
  @IsNotEmpty()
  identifierOrInternalId: IdentifierOrInternalId;

  @IsString()
  @IsNotEmpty()
  stepId: IdentifierOrInternalId;

  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  controlValues?: Record<string, unknown>;
}
