import { EnvironmentWithUserObjectCommand } from '@novu/application-generic';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpsertWorkflowDataCommand } from './upsert-workflow-data.command';

export class UpsertWorkflowCommand extends EnvironmentWithUserObjectCommand {
  @IsOptional()
  @IsString()
  workflowIdOrInternalId?: string;

  @ValidateNested()
  @Type(() => UpsertWorkflowDataCommand)
  workflowDto: UpsertWorkflowDataCommand;
}
