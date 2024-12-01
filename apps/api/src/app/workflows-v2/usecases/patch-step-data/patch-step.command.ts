import { EnvironmentWithUserObjectCommand } from '@novu/application-generic';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class PatchStepCommand extends EnvironmentWithUserObjectCommand {
  @IsString()
  @IsNotEmpty()
  workflowIdOrInternalId: string;

  @IsString()
  @IsNotEmpty()
  stepIdOrInternalId: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsObject()
  controlValues?: Record<string, unknown>;
}
