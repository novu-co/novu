import { EnvironmentWithUserObjectCommand } from '@novu/application-generic';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PatchWorkflowCommand extends EnvironmentWithUserObjectCommand {
  @IsString()
  @IsNotEmpty()
  workflowIdOrInternalId: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
