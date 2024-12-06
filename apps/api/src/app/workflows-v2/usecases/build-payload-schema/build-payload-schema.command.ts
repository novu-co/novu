import { EnvironmentWithUserCommand } from '@novu/application-generic';
import { IsString, IsObject, IsNotEmpty, IsOptional } from 'class-validator';

export class BuildPayloadSchemaCommand extends EnvironmentWithUserCommand {
  @IsString()
  @IsNotEmpty()
  workflowId: string;

  /**
   * Control values used for preview purposes
   * The payload schema is used for control values validation and sanitization
   */
  @IsObject()
  @IsOptional()
  controlValues?: Record<string, unknown>;
}
