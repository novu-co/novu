import { EnvironmentWithUserObjectCommand, type WorkflowInternalResponseDto } from '@novu/application-generic';

export class PostProcessWorkflowUpdateCommand extends EnvironmentWithUserObjectCommand {
  workflow: WorkflowInternalResponseDto;
}
