import {
  ApiServiceLevelEnum,
  ContentIssue,
  ControlValuesLevelEnum,
  DigestUnitEnum,
  RuntimeIssue,
  StepContentIssueEnum,
  StepCreateAndUpdateKeys,
  StepIssue,
  StepIssueEnum,
  StepIssues,
  StepIssuesDto,
  StepTypeEnum,
  UserSessionData,
  WorkflowIssueTypeEnum,
  WorkflowResponseDto,
  WorkflowStatusEnum,
} from '@novu/shared';
import {
  ControlValuesRepository,
  NotificationStepEntity,
  NotificationTemplateEntity,
  NotificationTemplateRepository,
  OrganizationEntity,
  OrganizationRepository,
} from '@novu/dal';
import { Injectable } from '@nestjs/common';

import { PostProcessWorkflowUpdateCommand } from './post-process-workflow-update.command';
import { OverloadContentDataOnWorkflowUseCase } from '../overload-content-data';

const MAX_NUMBER_OF_TAGS = 16;
const MAX_DELAY_DAYS_FREE_TIER = 30;
const MAX_DELAY_DAYS_BUSINESS_TIER = 90;

/**
 * Post-processes workflow updates by validating and updating workflow status.
 *
 * Key responsibilities:
 * - Validates workflow metadata issues (name, triggers, tags)
 * - Validates step metadata issues (body, controls)
 * - Updates workflow status based on validation results
 *
 * Works with {@link OverloadContentDataOnWorkflowUseCase} for control-value issues validation
 * and payload schema storage.
 */
@Injectable()
export class PostProcessWorkflowUpdate {
  constructor(
    private notificationTemplateRepository: NotificationTemplateRepository,
    private controlValuesRepository: ControlValuesRepository,
    private organizationRepository: OrganizationRepository,
    private overloadContentDataOnWorkflowUseCase: OverloadContentDataOnWorkflowUseCase
  ) {}

  async execute(command: PostProcessWorkflowUpdateCommand): Promise<NotificationTemplateEntity> {
    const workflowIssues = await this.validateWorkflow(command);
    const stepIssues = await this.validateSteps(command.workflow.steps, command.workflow._id, command.user);
    let transientWorkflow = this.updateIssuesOnWorkflow(command.workflow, workflowIssues, stepIssues);

    transientWorkflow = await this.overloadContentDataOnWorkflowUseCase.execute({
      user: command.user,
      workflow: transientWorkflow,
    });
    transientWorkflow = this.overloadStatusOnWorkflow(transientWorkflow);

    return transientWorkflow;
  }

  private overloadStatusOnWorkflow(workflowWithIssues: NotificationTemplateEntity) {
    // eslint-disable-next-line no-param-reassign
    workflowWithIssues.status = this.computeStatus(workflowWithIssues);

    return workflowWithIssues;
  }

  private computeStatus(workflowWithIssues: NotificationTemplateEntity) {
    const isWorkflowCompleteAndValid = this.isWorkflowCompleteAndValid(workflowWithIssues);

    return this.calculateStatus(isWorkflowCompleteAndValid, workflowWithIssues);
  }

  private calculateStatus(isGoodWorkflow: boolean, workflowWithIssues: NotificationTemplateEntity) {
    if (workflowWithIssues.active === false) {
      return WorkflowStatusEnum.INACTIVE;
    }

    if (isGoodWorkflow) {
      return WorkflowStatusEnum.ACTIVE;
    }

    return WorkflowStatusEnum.ERROR;
  }

  private isWorkflowCompleteAndValid(workflowWithIssues: NotificationTemplateEntity) {
    const workflowIssues = workflowWithIssues.issues && Object.keys(workflowWithIssues.issues).length > 0;
    const hasInnerIssues =
      workflowWithIssues.steps
        .map((step) => step.issues)
        .filter((issue) => issue != null)
        .filter((issue) => this.hasBodyIssues(issue) || this.hasControlIssues(issue)).length > 0;

    return !hasInnerIssues && !workflowIssues;
  }

  private hasControlIssues(issue: StepIssues) {
    return issue.controls && Object.keys(issue.controls).length > 0;
  }

  private hasBodyIssues(issue: StepIssues) {
    return issue.body && Object.keys(issue.body).length > 0;
  }

  private async validateSteps(
    steps: NotificationStepEntity[],
    _workflowId: string,
    user: UserSessionData
  ): Promise<Record<string, StepIssuesDto>> {
    const stepIdToIssues: Record<string, StepIssuesDto> = {};

    await Promise.all(
      steps.map(async (step) => {
        stepIdToIssues[step._templateId] = {
          body: this.addStepBodyIssues(step),
          controls: await this.buildControlIssues(step, _workflowId, user),
        };
      })
    );

    return stepIdToIssues;
  }

  private async buildControlIssues(step: NotificationStepEntity, _workflowId: string, user: UserSessionData) {
    const issues: Record<string, ContentIssue[]> = { ...(step.issues?.controls || {}) };

    const controlValueNeedAdditionValidation =
      step.template?.type !== StepTypeEnum.DIGEST && step.template?.type !== StepTypeEnum.DELAY;

    if (controlValueNeedAdditionValidation || !step.template?._id) {
      return issues;
    }

    const controlValues = await this.getValues(step._templateId, _workflowId, user.environmentId, user.organizationId);

    if (!controlValues) {
      return issues;
    }

    if (controlValues.unit && !controlValues.amount) {
      issues.amount = [
        ...(issues.amount || []),
        {
          issueType: StepContentIssueEnum.MISSING_VALUE,
          message: 'Amount is missing',
        },
      ];
    }

    if (!controlValues.unit && controlValues.amount) {
      issues.unit = [
        ...(issues.unit || []),
        {
          issueType: StepContentIssueEnum.MISSING_VALUE,
          message: 'Unit is missing',
        },
      ];
    }

    if (controlValues.amount && !this.isNumber(controlValues.amount)) {
      issues.amount = [
        ...(issues.amount || []),
        {
          issueType: StepContentIssueEnum.ILLEGAL_VARIABLE_IN_CONTROL_VALUE,
          message: 'Amount must be a number',
        },
      ];
    }

    if (controlValues.unit && !this.isValidDigestUnit(controlValues.unit)) {
      issues.unit = [
        ...(issues.unit || []),
        {
          issueType: StepContentIssueEnum.ILLEGAL_VARIABLE_IN_CONTROL_VALUE,
          message: 'Unit is not valid',
        },
      ];
    }

    let organization: OrganizationEntity | null = null;
    if (
      controlValues.unit &&
      controlValues.amount &&
      this.isNumber(controlValues.amount) &&
      this.isValidDigestUnit(controlValues.unit)
    ) {
      organization = await this.getOrganization(organization, user.organizationId);

      const delayInDays = this.calculateDaysFromUnit(controlValues.amount, controlValues.unit);

      const tier = organization?.apiServiceLevel;
      if (tier === undefined || tier === ApiServiceLevelEnum.BUSINESS || tier === ApiServiceLevelEnum.ENTERPRISE) {
        if (delayInDays > MAX_DELAY_DAYS_BUSINESS_TIER) {
          issues.tier = [
            ...(issues.tier || []),
            {
              issueType: StepContentIssueEnum.TIER_LIMIT_EXCEEDED,
              message:
                `The maximum delay allowed is ${MAX_DELAY_DAYS_BUSINESS_TIER} days.` +
                'Please contact our support team to discuss extending this limit for your use case.',
            },
          ];
        }
      }

      if (tier === ApiServiceLevelEnum.FREE) {
        if (delayInDays > MAX_DELAY_DAYS_FREE_TIER) {
          issues.tier = [
            ...(issues.tier || []),
            {
              issueType: StepContentIssueEnum.TIER_LIMIT_EXCEEDED,
              message:
                `The maximum delay allowed is ${MAX_DELAY_DAYS_FREE_TIER} days.` +
                'Please contact our support team to discuss extending this limit for your use case.',
            },
          ];
        }
      }
    }

    return issues;
  }

  private isValidDigestUnit(unit: unknown): unit is DigestUnitEnum {
    return Object.values(DigestUnitEnum).includes(unit as DigestUnitEnum);
  }

  private isNumber(value: unknown): value is number {
    return !Number.isNaN(Number(value));
  }

  private calculateDaysFromUnit(amount: number, unit: DigestUnitEnum): number {
    switch (unit) {
      case DigestUnitEnum.SECONDS:
        return amount / (24 * 60 * 60);
      case DigestUnitEnum.MINUTES:
        return amount / (24 * 60);
      case DigestUnitEnum.HOURS:
        return amount / 24;
      case DigestUnitEnum.DAYS:
        return amount;
      case DigestUnitEnum.WEEKS:
        return amount * 7;
      case DigestUnitEnum.MONTHS:
        return amount * 30; // Using 30 days as an approximation for a month
      default:
        return 0;
    }
  }

  private async getOrganization(
    organization: OrganizationEntity | null,
    organizationId: string
  ): Promise<OrganizationEntity | null> {
    if (organization === null) {
      return await this.organizationRepository.findById(organizationId);
    }

    return organization;
  }

  private async getValues(
    _stepId: string,
    _workflowId: string,
    _environmentId: string,
    _organizationId: string
  ): Promise<Record<string, unknown> | null> {
    const controlValuesEntity = await this.controlValuesRepository.findOne({
      _environmentId,
      _organizationId,
      _workflowId,
      _stepId,
      level: ControlValuesLevelEnum.STEP_CONTROLS,
    });

    if (!Object.keys(controlValuesEntity?.controls || {}).length) {
      return null;
    }

    return controlValuesEntity?.controls ?? null;
  }

  private async validateWorkflow(
    command: PostProcessWorkflowUpdateCommand
  ): Promise<Record<keyof WorkflowResponseDto, RuntimeIssue[]>> {
    // @ts-ignore
    const issues: Record<keyof WorkflowResponseDto, RuntimeIssue[]> = {};
    await this.addTriggerIdentifierNotUniqueIfApplicable(command, issues);
    this.addNameMissingIfApplicable(command, issues);
    this.addDescriptionTooLongIfApplicable(command, issues);
    this.addTagsIssues(command, issues);

    return issues;
  }

  private addNameMissingIfApplicable(
    command: PostProcessWorkflowUpdateCommand,
    issues: Record<keyof WorkflowResponseDto, RuntimeIssue[]>
  ) {
    if (!command.workflow.name || command.workflow.name.trim() === '') {
      // eslint-disable-next-line no-param-reassign
      issues.name = [{ issueType: WorkflowIssueTypeEnum.MISSING_VALUE, message: 'Name is missing' }];
    }
  }
  private addDescriptionTooLongIfApplicable(
    command: PostProcessWorkflowUpdateCommand,
    issues: Record<keyof WorkflowResponseDto, RuntimeIssue[]>
  ) {
    if (command.workflow.description && command.workflow.description.length > 160) {
      // eslint-disable-next-line no-param-reassign
      issues.description = [
        { issueType: WorkflowIssueTypeEnum.MAX_LENGTH_ACCESSED, message: 'Description is too long' },
      ];
    }
  }

  private async addTriggerIdentifierNotUniqueIfApplicable(
    command: PostProcessWorkflowUpdateCommand,
    issues: Record<keyof WorkflowResponseDto, RuntimeIssue[]>
  ) {
    const findAllByTriggerIdentifier = await this.notificationTemplateRepository.findAllByTriggerIdentifier(
      command.user.environmentId,
      command.workflow.triggers[0].identifier
    );
    if (findAllByTriggerIdentifier && findAllByTriggerIdentifier.length > 1) {
      // eslint-disable-next-line no-param-reassign
      command.workflow.triggers[0].identifier = `${command.workflow.triggers[0].identifier}-${command.workflow._id}`;
      // eslint-disable-next-line no-param-reassign
      issues.workflowId = [
        {
          issueType: WorkflowIssueTypeEnum.WORKFLOW_ID_ALREADY_EXISTS,
          message: 'Trigger identifier is not unique',
        },
      ];
    }
  }

  private addStepBodyIssues(step: NotificationStepEntity) {
    // @ts-ignore
    const issues: Record<StepCreateAndUpdateKeys, StepIssue> = {};
    if (!step.name || step.name.trim() === '') {
      issues.name = {
        issueType: StepIssueEnum.MISSING_REQUIRED_VALUE,
        message: 'Step name is missing',
      };
    }

    return issues;
  }

  private updateIssuesOnWorkflow(
    workflow: NotificationTemplateEntity,
    workflowIssues: Record<keyof WorkflowResponseDto, RuntimeIssue[]>,
    stepIssuesMap: Record<string, StepIssues>
  ): NotificationTemplateEntity {
    const issues = workflowIssues as unknown as Record<string, ContentIssue[]>;
    for (const step of workflow.steps) {
      if (stepIssuesMap[step._templateId]) {
        step.issues = stepIssuesMap[step._templateId];
      } else {
        step.issues = undefined;
      }
    }

    return { ...workflow, issues };
  }
  private addTagsIssues(
    command: PostProcessWorkflowUpdateCommand,
    issues: Record<keyof WorkflowResponseDto, RuntimeIssue[]>
  ) {
    const MAX_TAGS_LENGTH = 16;
    const tags = command.workflow.tags?.map((tag) => tag.trim());

    if (!tags.length) {
      return;
    }

    const tagsIssues: RuntimeIssue[] = [];

    const duplicatedTags = tags.filter((tag, index) => tags.indexOf(tag) !== index);
    const hasDuplications = duplicatedTags.length > 0;
    if (hasDuplications) {
      tagsIssues.push({
        issueType: WorkflowIssueTypeEnum.DUPLICATED_VALUE,
        message: `Duplicated tags: ${duplicatedTags.join(', ')}`,
      });
    }

    const hasEmptyTags = tags?.some((tag) => !tag || tag === '');
    if (hasEmptyTags) {
      tagsIssues.push({ issueType: WorkflowIssueTypeEnum.MISSING_VALUE, message: 'Empty tag value' });
    }

    const exceedsMaxLength = tags?.some((tag) => tag.length > MAX_NUMBER_OF_TAGS);
    if (exceedsMaxLength) {
      tagsIssues.push({
        issueType: WorkflowIssueTypeEnum.LIMIT_REACHED,
        message: `Exceeded the ${MAX_NUMBER_OF_TAGS} tag limit`,
      });
    }

    if (tagsIssues.length > 0) {
      // eslint-disable-next-line no-param-reassign
      issues.tags = tagsIssues;
    }
  }
}
