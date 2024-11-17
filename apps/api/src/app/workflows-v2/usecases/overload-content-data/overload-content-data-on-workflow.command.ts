import { EnvironmentWithUserObjectCommand, WorkflowInternalResponseDto } from '@novu/application-generic';

export class OverloadContentDataOnWorkflowCommand extends EnvironmentWithUserObjectCommand {
  workflow: WorkflowInternalResponseDto;
}
