import {
  DEFAULT_WORKFLOW_PREFERENCES,
  PreferencesResponseDto,
  PreferencesTypeEnum,
  ShortIsPrefixEnum,
  StepResponseDto,
  StepTypeEnum,
  WorkflowListResponseDto,
  WorkflowOriginEnum,
  WorkflowResponseDto,
  WorkflowStatusEnum,
  WorkflowTypeEnum,
} from '@novu/shared';
import { NotificationStepEntity, NotificationTemplateEntity } from '@novu/dal';
import { GetPreferencesResponseDto } from '@novu/application-generic';
import { buildSlug } from '../../shared/helpers/build-slug';

export function toResponseWorkflowDto(
  template: NotificationTemplateEntity,
  preferences: GetPreferencesResponseDto | undefined
): WorkflowResponseDto {
  const preferencesDto: PreferencesResponseDto = {
    user: preferences?.source[PreferencesTypeEnum.USER_WORKFLOW] || null,
    default: preferences?.source[PreferencesTypeEnum.WORKFLOW_RESOURCE] || DEFAULT_WORKFLOW_PREFERENCES,
  };
  const workflowName = template.name || 'Missing Name';

  return {
    _id: template._id,
    slug: buildSlug(workflowName, ShortIsPrefixEnum.WORKFLOW, template._id),
    workflowId: template.triggers[0].identifier,
    name: workflowName,
    tags: template.tags,
    active: template.active,
    preferences: preferencesDto,
    steps: getSteps(template),
    description: template.description,
    origin: computeOrigin(template),
    updatedAt: template.updatedAt || 'Missing Updated At',
    createdAt: template.createdAt || 'Missing Create At',
    status: WorkflowStatusEnum.ACTIVE,
  };
}

function getSteps(template: NotificationTemplateEntity) {
  const steps: StepResponseDto[] = [];
  for (const step of template.steps) {
    const stepResponseDto = toStepResponseDto(step);
    steps.push(stepResponseDto);
  }

  return steps;
}

function toMinifiedWorkflowDto(template: NotificationTemplateEntity): WorkflowListResponseDto {
  const workflowName = template.name || 'Missing Name';

  return {
    _id: template._id,
    workflowId: template.triggers[0].identifier,
    slug: buildSlug(workflowName, ShortIsPrefixEnum.WORKFLOW, template._id),
    name: workflowName,
    origin: computeOrigin(template),
    tags: template.tags,
    updatedAt: template.updatedAt || 'Missing Updated At',
    stepTypeOverviews: template.steps.map(buildStepTypeOverview).filter((stepTypeEnum) => !!stepTypeEnum),
    createdAt: template.createdAt || 'Missing Create At',
    status: WorkflowStatusEnum.ACTIVE,
  };
}

export function toWorkflowsMinifiedDtos(templates: NotificationTemplateEntity[]): WorkflowListResponseDto[] {
  return templates.map(toMinifiedWorkflowDto);
}

function toStepResponseDto(step: NotificationStepEntity): StepResponseDto {
  const stepName = step.name || 'Missing Name';

  return {
    _id: step._templateId,
    slug: buildSlug(stepName, ShortIsPrefixEnum.STEP, step._templateId),
    name: stepName,
    stepId: step.stepId || 'Missing Step Id',
    type: step.template?.type || StepTypeEnum.EMAIL,
  } satisfies StepResponseDto;
}

function buildStepTypeOverview(step: NotificationStepEntity): StepTypeEnum | undefined {
  return step.template?.type;
}

function computeOrigin(template: NotificationTemplateEntity): WorkflowOriginEnum {
  // Required to differentiate between old V1 and new workflows in an attempt to eliminate the need for type field
  return template?.type === WorkflowTypeEnum.REGULAR
    ? WorkflowOriginEnum.NOVU_CLOUD_V1
    : template.origin || WorkflowOriginEnum.EXTERNAL;
}
