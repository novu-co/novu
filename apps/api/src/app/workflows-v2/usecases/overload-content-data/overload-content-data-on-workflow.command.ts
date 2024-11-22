import { EnvironmentWithUserObjectCommand, type WorkflowInternalResponseDto } from '@novu/application-generic';

export class OverloadContentDataOnWorkflowCommand extends EnvironmentWithUserObjectCommand {
  workflow: WorkflowInternalResponseDto;
}
