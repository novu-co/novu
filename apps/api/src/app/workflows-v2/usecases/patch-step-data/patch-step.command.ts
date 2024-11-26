import { EnvironmentWithUserObjectCommand } from '@novu/application-generic';
import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { IdentifierOrInternalId } from '@novu/shared';

export class PatchStepCommand extends EnvironmentWithUserObjectCommand {
  @IsString()
  @IsNotEmpty()
  workflowIdentifierOrInternalId: IdentifierOrInternalId;

  @IsString()
  @IsNotEmpty()
  _stepId: string;

  @IsString()
  @IsOptional()
  stepId?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsObject()
  controlValues?: Record<string, unknown>;
}
