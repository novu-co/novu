import { EnvironmentWithUserObjectCommand } from '@novu/application-generic';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { IdentifierOrInternalId } from '@novu/shared';

export class PatchStepCommand extends EnvironmentWithUserObjectCommand {
  @IsString()
  @IsNotEmpty()
  workflowIdentifierOrInternalId: IdentifierOrInternalId;

  @IsString()
  @IsNotEmpty()
  stepIdOrInternalId: IdentifierOrInternalId;

  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsObject()
  controlValues?: Record<string, unknown>;
}
