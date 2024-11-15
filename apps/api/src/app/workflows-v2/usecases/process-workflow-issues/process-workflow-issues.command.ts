import { EnvironmentWithUserObjectCommand, WorkflowInternalResponseDto } from '@novu/application-generic';
import { ControlValuesEntity } from '@novu/dal';
import { ValidatedContentResponse } from '../validate-content';

export class ProcessWorkflowIssuesCommand extends EnvironmentWithUserObjectCommand {
  workflow: WorkflowInternalResponseDto;
  stepIdToControlValuesMap: { [p: string]: ControlValuesEntity };
  validatedContentsArray: Record<string, ValidatedContentResponse>;
}
