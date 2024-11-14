import {
  ContentIssue,
  RuntimeIssue,
  StepIssueEnum,
  StepIssues,
  StepIssuesDto,
  WorkflowIssueTypeEnum,
  WorkflowResponseDto,
  WorkflowStatusEnum,
} from '@novu/shared';
import {
  ControlValuesEntity,
  NotificationStepEntity,
  NotificationTemplateEntity,
  NotificationTemplateRepository,
} from '@novu/dal';
import { Injectable } from '@nestjs/common';
import { ProcessWorkflowIssuesCommand } from './process-workflow-issues.command';
import { ValidateControlValuesAndConstructPassableStructureUsecase } from '../validate-control-values/build-default-control-values-usecase.service';
import { WorkflowNotFoundException } from '../../exceptions/workflow-not-found-exception';

@Injectable()
export class ProcessWorkflowIssuesUsecase {
  constructor(
    private notificationTemplateRepository: NotificationTemplateRepository,
    private buildDefaultControlValuesUsecase: ValidateControlValuesAndConstructPassableStructureUsecase
  ) {}

  async execute(command: ProcessWorkflowIssuesCommand): Promise<NotificationTemplateEntity> {
    const workflowIssues = await this.validateWorkflow(command);
    const stepIssues = this.validateSteps(command.workflow.steps, command.stepIdToControlValuesMap);
    const workflowWithIssues = this.updateIssuesOnWorkflow(command.workflow, workflowIssues, stepIssues);
    await this.persistWorkflow(command, workflowWithIssues);

    return await this.getWorkflow(command);
  }

  private async persistWorkflow(command: ProcessWorkflowIssuesCommand, workflowWithIssues: NotificationTemplateEntity) {
    const isWorkflowCompleteAndValid = this.isWorkflowCompleteAndValid(workflowWithIssues);
    const status = this.calculateStatus(isWorkflowCompleteAndValid, workflowWithIssues);
    await this.notificationTemplateRepository.update(
      {
        _id: command.workflow._id,
        _environmentId: command.user.environmentId,
      },
      {
        ...workflowWithIssues,
        status,
      }
    );
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

  private async getWorkflow(command: ProcessWorkflowIssuesCommand) {
    const entity = await this.notificationTemplateRepository.findById(command.workflow._id, command.user.environmentId);
    if (entity == null) {
      throw new WorkflowNotFoundException(command.workflow._id);
    }

    return entity;
  }

  private validateSteps(
    steps: NotificationStepEntity[],
    stepIdToControlValuesMap: { [p: string]: ControlValuesEntity }
  ): Record<string, StepIssuesDto> {
    const stepIdToIssues: Record<string, StepIssuesDto> = {};
    for (const step of steps) {
      // @ts-ignore
      const stepIssues: Required<StepIssuesDto> = { body: {}, controls: {} };
      this.addControlIssues(step, stepIdToControlValuesMap, stepIssues);
      this.addStepBodyIssues(step, stepIssues);
      stepIdToIssues[step._templateId] = stepIssues;
    }

    return stepIdToIssues;
  }

  private addControlIssues(
    step: NotificationStepEntity,
    stepIdToControlValuesMap: {
      [p: string]: ControlValuesEntity;
    },
    stepIssues: StepIssuesDto
  ) {
    if (step.template?.controls) {
      const { issuesMissingValues } = this.buildDefaultControlValuesUsecase.execute({
        controlSchema: step.template?.controls,
        controlValues: stepIdToControlValuesMap[step._templateId].controls,
      });
      // eslint-disable-next-line no-param-reassign
      stepIssues.controls = issuesMissingValues;
    }
  }
  private async validateWorkflow(
    command: ProcessWorkflowIssuesCommand
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
    command: ProcessWorkflowIssuesCommand,
    issues: Record<keyof WorkflowResponseDto, RuntimeIssue[]>
  ) {
    if (!command.workflow.name || command.workflow.name.trim() === '') {
      // eslint-disable-next-line no-param-reassign
      issues.name = [{ issueType: WorkflowIssueTypeEnum.MISSING_VALUE, message: 'Name is missing' }];
    }
  }

  private addTagsIssues(
    command: ProcessWorkflowIssuesCommand,
    issues: Record<keyof WorkflowResponseDto, RuntimeIssue[]>
  ) {
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

    const exceedsMaxLength = tags?.some((tag) => tag.length > 8);
    if (exceedsMaxLength) {
      tagsIssues.push({
        issueType: WorkflowIssueTypeEnum.LIMIT_REACHED,
        message: 'Exceeded the 8 tag limit',
      });
    }

    if (tagsIssues.length > 0) {
      // eslint-disable-next-line no-param-reassign
      issues.tags = tagsIssues;
    }
  }

  private addDescriptionTooLongIfApplicable(
    command: ProcessWorkflowIssuesCommand,
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
    command: ProcessWorkflowIssuesCommand,
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

  private addStepBodyIssues(step: NotificationStepEntity, stepIssues: Required<StepIssuesDto>) {
    if (!step.name || step.name.trim() === '') {
      // eslint-disable-next-line no-param-reassign
      stepIssues.body.name = {
        issueType: StepIssueEnum.MISSING_REQUIRED_VALUE,
        message: 'Step name is missing',
      };
    }
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
}
