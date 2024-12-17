import { EnvironmentWithUserObjectCommand, MAX_NAME_LENGTH } from '@novu/application-generic';
import { IsNotEmpty, IsObject, IsOptional, IsString, Length } from 'class-validator';

export class PatchStepCommand extends EnvironmentWithUserObjectCommand {
  @IsString()
  @IsNotEmpty()
  workflowIdOrInternalId: string;

  @IsString()
  @IsNotEmpty()
  stepIdOrInternalId: string;

  @IsOptional()
  @Length(1, MAX_NAME_LENGTH)
  @IsString()
  name?: string;

  @IsOptional()
  @IsObject()
  controlValues?: Record<string, unknown> | null;
}
