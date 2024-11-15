import { EnvironmentWithUserObjectCommand } from '@novu/application-generic';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IdentifierOrInternalId, PatchStepFieldEnum } from '@novu/shared';

export class PatchStepDataCommand extends EnvironmentWithUserObjectCommand {
  @IsString()
  @IsNotEmpty()
  identifierOrInternalId: IdentifierOrInternalId;

  @IsString()
  @IsNotEmpty()
  stepId: IdentifierOrInternalId;
  @IsArray()
  fieldsToUpdate: PatchStepFieldEnum[];

  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  controlValues?: Record<string, unknown>;
}
