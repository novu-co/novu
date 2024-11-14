import { EnvironmentWithUserObjectCommand, GetWorkflowByIdsResponseDto } from '@novu/application-generic';
import { ControlValuesEntity } from '@novu/dal';

export class ProcessWorkflowIssuesCommand extends EnvironmentWithUserObjectCommand {
  workflow: GetWorkflowByIdsResponseDto;
  stepIdToControlValuesMap: { [p: string]: ControlValuesEntity };
}
