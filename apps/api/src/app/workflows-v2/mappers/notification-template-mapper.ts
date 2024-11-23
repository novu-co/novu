import {
  PreferencesResponseDto,
  RuntimeIssue,
  ShortIsPrefixEnum,
  StepResponseDto,
  StepTypeEnum,
  WorkflowCreateAndUpdateKeys,
  WorkflowListResponseDto,
  WorkflowOriginEnum,
  WorkflowResponseDto,
  WorkflowStatusEnum,
  WorkflowTypeEnum,
} from '@novu/shared';
import { NotificationStepEntity, NotificationTemplateEntity } from '@novu/dal';
import { WorkflowInternalResponseDto } from '@novu/application-generic';
import { buildSlug } from '../../shared/helpers/build-slug';

export function toResponseWorkflowDto(workflow: WorkflowInternalResponseDto): WorkflowResponseDto {
  const preferencesDto: PreferencesResponseDto = {
    user: workflow.userPreferences,
    default: workflow.defaultPreferences,
  };
  const workflowName = workflow.name || 'Missing Name';

  return {
    _id: workflow._id,
    slug: buildSlug(workflowName, ShortIsPrefixEnum.WORKFLOW, workflow._id),
    workflowId: workflow.triggers[0].identifier,
    name: workflowName,
    tags: workflow.tags,
    active: workflow.active,
    preferences: preferencesDto,
    steps: getSteps(workflow),
    description: workflow.description,
    origin: computeOrigin(workflow),
    updatedAt: workflow.updatedAt || 'Missing Updated At',
    createdAt: workflow.createdAt || 'Missing Create At',
    status: workflow.status || WorkflowStatusEnum.ACTIVE,
    issues: workflow.issues as unknown as Record<WorkflowCreateAndUpdateKeys, RuntimeIssue>,
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
    status: template.status || WorkflowStatusEnum.ACTIVE,
  };
}

export function toWorkflowsMinifiedDtos(templates: NotificationTemplateEntity[]): WorkflowListResponseDto[] {
  return templates.map(toMinifiedWorkflowDto);
}

function toStepResponseDto(persistedStep: NotificationStepEntity): StepResponseDto {
  const stepName = persistedStep.name || 'Missing Name';

  return {
    _id: persistedStep._templateId,
    slug: buildSlug(stepName, ShortIsPrefixEnum.STEP, persistedStep._templateId),
    name: stepName,
    stepId: persistedStep.stepId || 'Missing Step Id',
    type: persistedStep.template?.type || StepTypeEnum.EMAIL,
    issues: persistedStep.issues,
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
