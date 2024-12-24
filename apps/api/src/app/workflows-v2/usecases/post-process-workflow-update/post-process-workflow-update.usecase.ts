import {
  RuntimeIssueDto,
  StepCreateAndUpdateKeys,
  StepIssue,
  StepIssueEnum,
  StepIssues,
  StepIssuesDto,
  WorkflowIssueTypeEnum,
  WorkflowResponseDto,
  WorkflowStatusEnum,
} from '@novu/shared';
import { NotificationStepEntity, NotificationTemplateRepository, RuntimeIssue } from '@novu/dal';
import { Injectable } from '@nestjs/common';
import { Instrument, InstrumentUsecase, WorkflowInternalResponseDto } from '@novu/application-generic';
import { PostProcessWorkflowUpdateCommand } from './post-process-workflow-update.command';
import { OverloadContentDataOnWorkflowUseCase } from '../overload-content-data';

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
    private overloadContentDataOnWorkflowUseCase: OverloadContentDataOnWorkflowUseCase
  ) {}

  @InstrumentUsecase()
  async execute(command: PostProcessWorkflowUpdateCommand): Promise<WorkflowInternalResponseDto> {
    const workflowIssues = await this.validateWorkflow(command);
    const stepIssues = this.validateSteps(command.workflow.steps, command.workflow._id);
    let transientWorkflow = this.updateIssuesOnWorkflow(command.workflow, stepIssues, workflowIssues);

    transientWorkflow = await this.overloadContentDataOnWorkflowUseCase.execute({
      user: command.user,
      workflow: transientWorkflow,
    });
    transientWorkflow = this.overloadStatusOnWorkflow(transientWorkflow);

    return transientWorkflow;
  }

  private overloadStatusOnWorkflow(workflowWithIssues: WorkflowInternalResponseDto) {
    // eslint-disable-next-line no-param-reassign
    workflowWithIssues.status = this.computeStatus(workflowWithIssues);

    return workflowWithIssues;
  }

  private computeStatus(workflowWithIssues: WorkflowInternalResponseDto) {
    const isWorkflowCompleteAndValid = this.isWorkflowCompleteAndValid(workflowWithIssues);

    return this.calculateStatus(isWorkflowCompleteAndValid, workflowWithIssues);
  }

  private calculateStatus(isGoodWorkflow: boolean, workflowWithIssues: WorkflowInternalResponseDto) {
    if (workflowWithIssues.active === false) {
      return WorkflowStatusEnum.INACTIVE;
    }

    if (isGoodWorkflow) {
      return WorkflowStatusEnum.ACTIVE;
    }

    return WorkflowStatusEnum.ERROR;
  }

  private isWorkflowCompleteAndValid(workflowWithIssues: WorkflowInternalResponseDto) {
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

  private validateSteps(
    steps: NotificationStepEntity[],
    _workflowId: string
  ): Record<string, StepIssuesDto> | undefined {
    const stepIdToIssues: Record<string, StepIssuesDto> = {};

    for (const step of steps) {
      stepIdToIssues[step._templateId] = {
        body: this.addStepBodyIssues(step),
        controls: step.issues?.controls,
      };
    }

    return Object.keys(stepIdToIssues).length > 0 ? stepIdToIssues : undefined;
  }

  @Instrument()
  private async validateWorkflow(
    command: PostProcessWorkflowUpdateCommand
  ): Promise<Record<keyof WorkflowResponseDto, RuntimeIssueDto[]> | undefined> {
    // @ts-ignore
    const issues: Record<keyof WorkflowResponseDto, RuntimeIssueDTO[]> = {};
    await this.addTriggerIdentifierNotUniqueIfApplicable(command, issues);

    return Object.keys(issues).length > 0 ? issues : undefined;
  }

  @Instrument()
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
    workflow: WorkflowInternalResponseDto,
    stepIssuesMap?: Record<string, StepIssues>,
    workflowIssues?: Record<keyof WorkflowResponseDto, RuntimeIssueDto[]>
  ): WorkflowInternalResponseDto {
    const { steps } = workflow;
    for (const step of steps) {
      if (stepIssuesMap && stepIssuesMap[step._templateId]) {
        step.issues = stepIssuesMap[step._templateId];
      } else {
        step.issues = undefined;
      }
    }

    return {
      ...workflow,
      steps,
      issues: workflowIssues as unknown as Record<string, RuntimeIssue[]>,
    };
  }
}
