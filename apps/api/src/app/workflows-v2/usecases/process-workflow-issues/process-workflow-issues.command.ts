import { EnvironmentWithUserObjectCommand, GetWorkflowResponseDto } from '@novu/application-generic';
import { ControlValuesEntity } from '@novu/dal';
import { ValidatedContentResponse } from '../validate-content';

export class ProcessWorkflowIssuesCommand extends EnvironmentWithUserObjectCommand {
  workflow: GetWorkflowResponseDto;
  stepIdToControlValuesMap: { [p: string]: ControlValuesEntity };
  validatedContentsArray: Record<string, ValidatedContentResponse>;
}
