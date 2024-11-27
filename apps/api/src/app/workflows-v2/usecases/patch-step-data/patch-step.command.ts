import { EnvironmentWithUserObjectCommand } from '@novu/application-generic';
import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
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
  @IsObject()
  controlValues?: Record<string, unknown>;
}
