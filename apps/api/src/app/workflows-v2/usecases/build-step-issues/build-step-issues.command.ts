import { WorkflowOriginEnum, StepCreateDto, StepUpdateDto, JSONSchemaDto } from '@novu/shared';
import { NotificationStepEntity, NotificationTemplateEntity } from '@novu/dal';
import { EnvironmentWithUserObjectCommand } from '@novu/application-generic';
import { IsEnum, IsObject, IsDefined } from 'class-validator';

export class BuildStepIssuesCommand extends EnvironmentWithUserObjectCommand {
  @IsDefined()
  @IsEnum(WorkflowOriginEnum)
  workflowOrigin: WorkflowOriginEnum;

  @IsDefined()
  step: NotificationStepEntity | undefined;

  @IsObject()
  @IsDefined()
  stepDto: StepCreateDto | StepUpdateDto;

  @IsDefined()
  workflow: NotificationTemplateEntity | undefined;

  @IsObject()
  @IsDefined()
  controlSchema: JSONSchemaDto;
}
