import { BadRequestException, Injectable } from '@nestjs/common';
import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import _ from 'lodash';

import {
  ControlValuesRepository,
  NotificationGroupRepository,
  NotificationStepEntity,
  NotificationTemplateEntity,
} from '@novu/dal';
import {
  ContentIssue,
  JSONSchemaDto,
  DEFAULT_WORKFLOW_PREFERENCES,
  slugify,
  StepContentIssueEnum,
  StepCreateDto,
  StepIssuesDto,
  StepUpdateDto,
  UserSessionData,
  StepTypeEnum,
  WorkflowCreationSourceEnum,
  WorkflowOriginEnum,
  WorkflowResponseDto,
  WorkflowTypeEnum,
  ControlValuesLevelEnum,
  WorkflowStatusEnum,
  StepIssues,
  ControlSchemas,
} from '@novu/shared';
import {
  CreateWorkflow as CreateWorkflowGeneric,
  CreateWorkflowCommand,
  GetWorkflowByIdsCommand,
  GetWorkflowByIdsUseCase,
  Instrument,
  InstrumentUsecase,
  NotificationStep,
  shortId,
  UpdateWorkflow as UpdateWorkflowGeneric,
  UpdateWorkflowCommand,
  WorkflowInternalResponseDto,
  TierRestrictionsValidateUsecase,
  UpsertControlValuesCommand,
  UpsertControlValuesUseCase,
  TierRestrictionsValidateCommand,
  dashboardSanitizeControlValues,
  PinoLogger,
} from '@novu/application-generic';

import { UpsertWorkflowCommand, UpsertWorkflowDataCommand } from './upsert-workflow.command';
import { stepTypeToControlSchema } from '../../shared';
import { GetWorkflowCommand, GetWorkflowUseCase } from '../get-workflow';
import { buildVariables } from '../../util/build-variables';
import { BuildAvailableVariableSchemaCommand, BuildAvailableVariableSchemaUsecase } from '../build-variable-schema';

@Injectable()
export class UpsertWorkflowUseCase {
  constructor(
    private createWorkflowGenericUsecase: CreateWorkflowGeneric,
    private updateWorkflowGenericUsecase: UpdateWorkflowGeneric,
    private notificationGroupRepository: NotificationGroupRepository,
    private getWorkflowByIdsUseCase: GetWorkflowByIdsUseCase,
    private getWorkflowUseCase: GetWorkflowUseCase,
    private buildAvailableVariableSchemaUsecase: BuildAvailableVariableSchemaUsecase,
    private controlValuesRepository: ControlValuesRepository,
    private upsertControlValuesUseCase: UpsertControlValuesUseCase,
    private tierRestrictionsValidateUsecase: TierRestrictionsValidateUsecase,
    private logger: PinoLogger
  ) {}

  @InstrumentUsecase()
  async execute(command: UpsertWorkflowCommand): Promise<WorkflowResponseDto> {
    const workflowForUpdate = await this.queryWorkflow(command);
    const persistedWorkflow = await this.createOrUpdateWorkflow(workflowForUpdate, command);
    // TODO: this upsertControlValues logic should be moved to the create/update workflow usecase
    await this.upsertControlValues(persistedWorkflow, command);
    const workflow = await this.getWorkflowUseCase.execute(
      GetWorkflowCommand.create({
        workflowIdOrInternalId: persistedWorkflow._id,
        user: command.user,
      })
    );

    return workflow;
  }

  @Instrument()
  private async queryWorkflow(command: UpsertWorkflowCommand): Promise<WorkflowInternalResponseDto | null> {
    if (!command.workflowIdOrInternalId) {
      return null;
    }

    return await this.getWorkflowByIdsUseCase.execute(
      GetWorkflowByIdsCommand.create({
        environmentId: command.user.environmentId,
        organizationId: command.user.organizationId,
        userId: command.user._id,
        workflowIdOrInternalId: command.workflowIdOrInternalId,
      })
    );
  }

  @Instrument()
  private async createOrUpdateWorkflow(
    existingWorkflow: NotificationTemplateEntity | null,
    command: UpsertWorkflowCommand
  ): Promise<WorkflowInternalResponseDto> {
    if (existingWorkflow && isWorkflowUpdateDto(command.workflowDto, command.workflowIdOrInternalId)) {
      return await this.updateWorkflowGenericUsecase.execute(
        UpdateWorkflowCommand.create(
          await this.buildUpdateWorkflowCommand(command.workflowDto, command.user, existingWorkflow)
        )
      );
    }

    return await this.createWorkflowGenericUsecase.execute(
      CreateWorkflowCommand.create(await this.buildCreateWorkflowCommand(command))
    );
  }

  @Instrument()
  private async buildCreateWorkflowCommand(command: UpsertWorkflowCommand): Promise<CreateWorkflowCommand> {
    const { user, workflowDto } = command;
    const isWorkflowActive = workflowDto?.active ?? true;
    const notificationGroupId = await this.getNotificationGroup(command.user.environmentId);

    if (!notificationGroupId) {
      throw new BadRequestException('Notification group not found');
    }
    const steps = await this.mapSteps(workflowDto.origin, command.user, workflowDto.steps);

    return {
      notificationGroupId,
      environmentId: user.environmentId,
      organizationId: user.organizationId,
      userId: user._id,
      name: workflowDto.name,
      __source: workflowDto.__source || WorkflowCreationSourceEnum.DASHBOARD,
      type: WorkflowTypeEnum.BRIDGE,
      origin: WorkflowOriginEnum.NOVU_CLOUD,
      steps,
      active: isWorkflowActive,
      description: workflowDto.description || '',
      tags: workflowDto.tags || [],
      userPreferences: command.workflowDto.preferences?.user ?? null,
      defaultPreferences: command.workflowDto.preferences?.workflow ?? DEFAULT_WORKFLOW_PREFERENCES,
      triggerIdentifier: slugify(workflowDto.name),
      status: this.computeStatus(command.workflowDto, steps),
    };
  }

  private computeStatus(workflow: UpsertWorkflowDataCommand, steps: NotificationStep[]) {
    if (workflow.active === false) {
      return WorkflowStatusEnum.INACTIVE;
    }

    const hasIssues = steps.filter((step) => this.hasControlIssues(step.issues)).length > 0;
    if (!hasIssues) {
      return WorkflowStatusEnum.ACTIVE;
    }

    return WorkflowStatusEnum.ERROR;
  }

  private hasControlIssues(issue: StepIssues | undefined) {
    return issue?.controls && Object.keys(issue.controls).length > 0;
  }

  private async buildUpdateWorkflowCommand(
    workflowDto: UpsertWorkflowDataCommand,
    user: UserSessionData,
    existingWorkflow: NotificationTemplateEntity
  ): Promise<UpdateWorkflowCommand> {
    const steps = await this.mapSteps(workflowDto.origin, user, workflowDto.steps, existingWorkflow);

    return {
      id: existingWorkflow._id,
      environmentId: existingWorkflow._environmentId,
      organizationId: user.organizationId,
      userId: user._id,
      name: workflowDto.name,
      steps,
      rawData: workflowDto as unknown as Record<string, unknown>,
      type: WorkflowTypeEnum.BRIDGE,
      description: workflowDto.description,
      userPreferences: workflowDto.preferences?.user ?? null,
      defaultPreferences: workflowDto.preferences?.workflow ?? DEFAULT_WORKFLOW_PREFERENCES,
      tags: workflowDto.tags,
      active: workflowDto.active ?? true,
      status: this.computeStatus(workflowDto, steps),
    };
  }
  private async mapSteps(
    workflowOrigin: WorkflowOriginEnum,
    user: UserSessionData,
    commandWorkflowSteps: Array<StepCreateDto | StepUpdateDto>,
    persistedWorkflow?: NotificationTemplateEntity | undefined
  ): Promise<NotificationStep[]> {
    const steps: NotificationStep[] = [];

    for (const step of commandWorkflowSteps) {
      const mappedStep = await this.mapSingleStep(workflowOrigin, user, persistedWorkflow, step);
      const baseStepId = mappedStep.stepId;

      if (baseStepId) {
        const previousStepIds = steps.map((stepX) => stepX.stepId).filter((id) => id != null);
        mappedStep.stepId = this.generateUniqueStepId(baseStepId, previousStepIds);
      }

      steps.push(mappedStep);
    }

    return steps;
  }

  private generateUniqueStepId(baseStepId: string, previousStepIds: string[]): string {
    let currentStepId = baseStepId;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      if (isUniqueStepId(currentStepId, previousStepIds)) {
        break;
      }
      currentStepId = `${baseStepId}-${shortId()}`;
      attempts += 1;
    }

    if (attempts === maxAttempts && !isUniqueStepId(currentStepId, previousStepIds)) {
      throw new BadRequestException({
        message: 'Failed to generate unique stepId',
        stepId: baseStepId,
      });
    }

    return currentStepId;
  }

  private async mapSingleStep(
    workflowOrigin: WorkflowOriginEnum,
    user: UserSessionData,
    persistedWorkflow: NotificationTemplateEntity | undefined,
    step: StepUpdateDto | StepCreateDto
  ): Promise<NotificationStep> {
    const foundPersistedStep = this.getPersistedStepIfFound(persistedWorkflow, step);
    const controlSchemas: ControlSchemas = foundPersistedStep?.template?.controls || stepTypeToControlSchema[step.type];
    const issues: StepIssuesDto = await this.buildIssues(
      workflowOrigin,
      user,
      foundPersistedStep,
      persistedWorkflow,
      step,
      controlSchemas
    );

    const stepEntityToReturn = {
      template: {
        type: step.type,
        name: step.name,
        controls: controlSchemas,
        content: '',
      },
      stepId: foundPersistedStep?.stepId || slugify(step.name),
      name: step.name,
      issues,
    };

    if (foundPersistedStep) {
      return {
        ...stepEntityToReturn,
        _id: foundPersistedStep._templateId,
        _templateId: foundPersistedStep._templateId,
        template: { ...stepEntityToReturn.template, _id: foundPersistedStep._templateId },
      };
    }

    return stepEntityToReturn;
  }

  private async buildIssues(
    workflowOrigin: WorkflowOriginEnum,
    user: UserSessionData,
    foundPersistedStep: NotificationStepEntity | undefined,
    persistedWorkflow: NotificationTemplateEntity | undefined,
    step: StepCreateDto | StepUpdateDto,
    controlSchemas: ControlSchemas
  ) {
    const variableSchema = await this.buildAvailableVariableSchemaUsecase.execute(
      BuildAvailableVariableSchemaCommand.create({
        environmentId: user.environmentId,
        organizationId: user.organizationId,
        userId: user._id,
        stepInternalId: foundPersistedStep?.stepId,
        workflow: persistedWorkflow,
        ...(step.controlValues ? { optimisticControlValues: step.controlValues } : {}),
      })
    );

    let controlValueLocal = step.controlValues;

    if (!controlValueLocal) {
      controlValueLocal = (
        await this.controlValuesRepository.findOne({
          _environmentId: user.environmentId,
          _organizationId: user.organizationId,
          _workflowId: persistedWorkflow?._id,
          _stepId: foundPersistedStep?._templateId,
          level: ControlValuesLevelEnum.STEP_CONTROLS,
        })
      )?.controls;
    }

    const sanitizedControlValues =
      controlValueLocal && workflowOrigin === WorkflowOriginEnum.NOVU_CLOUD
        ? dashboardSanitizeControlValues(this.logger, controlValueLocal, step.type) || {}
        : frameworkSanitizeEmptyStringsToNull(controlValueLocal) || {};

    const controlIssues = processControlValuesBySchema(controlSchemas?.schema, sanitizedControlValues || {});
    const liquidTemplateIssues = processControlValuesByLiquid(variableSchema, controlValueLocal || {});
    const customIssues = await this.processControlValuesByRules(user, step.type, sanitizedControlValues || {});
    const customControlIssues = _.isEmpty(customIssues) ? {} : { controls: customIssues };

    return _.merge(controlIssues, liquidTemplateIssues, customControlIssues);
  }

  private getPersistedStepIfFound(
    persistedWorkflow: NotificationTemplateEntity | undefined,
    stepUpdateRequest: StepUpdateDto | StepCreateDto
  ) {
    if (!persistedWorkflow?.steps) {
      return;
    }

    for (const persistedStep of persistedWorkflow.steps) {
      if (this.isStepUpdateDto(stepUpdateRequest) && persistedStep._templateId === stepUpdateRequest._id) {
        return persistedStep;
      }
    }
  }

  private isStepUpdateDto(obj: StepUpdateDto | StepCreateDto): obj is StepUpdateDto {
    return typeof obj === 'object' && obj !== null && !!(obj as StepUpdateDto)._id;
  }

  private async getNotificationGroup(environmentId: string): Promise<string | undefined> {
    return (
      await this.notificationGroupRepository.findOne(
        {
          name: 'General',
          _environmentId: environmentId,
        },
        '_id'
      )
    )?._id;
  }

  @Instrument()
  private async upsertControlValues(
    workflow: NotificationTemplateEntity,
    command: UpsertWorkflowCommand
  ): Promise<void> {
    const controlValuesUpdates = this.getControlValuesUpdates(workflow.steps, command);
    if (controlValuesUpdates.length === 0) return;

    await Promise.all(
      controlValuesUpdates.map((update) => this.executeControlValuesUpdate(update, workflow._id, command))
    );
  }

  private getControlValuesUpdates(steps: NotificationStepEntity[], command: UpsertWorkflowCommand) {
    return steps
      .map((step) => {
        const controlValues = this.findControlValueInRequest(step, command.workflowDto.steps);
        if (controlValues === undefined) return null;

        return {
          step,
          controlValues,
          shouldDelete: controlValues === null,
        };
      })
      .filter((update): update is NonNullable<typeof update> => update !== null);
  }

  private executeControlValuesUpdate(
    update: { step: NotificationStepEntity; controlValues: Record<string, unknown> | null; shouldDelete: boolean },
    workflowId: string,
    command: UpsertWorkflowCommand
  ) {
    if (update.shouldDelete) {
      return this.controlValuesRepository.delete({
        _environmentId: command.user.environmentId,
        _organizationId: command.user.organizationId,
        _workflowId: workflowId,
        _stepId: update.step._templateId,
        level: ControlValuesLevelEnum.STEP_CONTROLS,
      });
    }

    return this.upsertControlValuesUseCase.execute(
      UpsertControlValuesCommand.create({
        organizationId: command.user.organizationId,
        environmentId: command.user.environmentId,
        notificationStepEntity: update.step,
        workflowId,
        newControlValues: update.controlValues || {},
      })
    );
  }

  private findControlValueInRequest(
    step: NotificationStepEntity,
    steps: (StepCreateDto | StepUpdateDto)[] | StepCreateDto[]
  ): Record<string, unknown> | undefined | null {
    return steps.find((stepRequest) => {
      if (this.isStepUpdateDto(stepRequest)) {
        return stepRequest._id === step._templateId;
      }

      return stepRequest.name === step.name;
    })?.controlValues;
  }

  private async processControlValuesByRules(
    user: UserSessionData,
    stepType: StepTypeEnum,
    controlValues: Record<string, unknown> | null
  ): Promise<StepIssuesDto> {
    const restrictionsErrors = await this.tierRestrictionsValidateUsecase.execute(
      TierRestrictionsValidateCommand.create({
        amount: controlValues?.amount as number | undefined,
        unit: controlValues?.unit as string | undefined,
        cron: controlValues?.cron as string | undefined,
        organizationId: user.organizationId,
        stepType,
      })
    );

    if (!restrictionsErrors) {
      return {};
    }

    const result: Record<string, ContentIssue[]> = {};
    for (const restrictionsError of restrictionsErrors) {
      result[restrictionsError.controlKey] = [
        {
          issueType: StepContentIssueEnum.TIER_LIMIT_EXCEEDED,
          message: restrictionsError.message,
        },
      ];
    }

    return result;
  }
}

function isWorkflowUpdateDto(workflowDto: UpsertWorkflowDataCommand, id?: string) {
  return !!id;
}

function isUniqueStepId(stepIdToValidate: string, otherStepsIds: string[]) {
  return !otherStepsIds.some((stepId) => stepId === stepIdToValidate);
}

function processControlValuesByLiquid(
  variableSchema: JSONSchemaDto | undefined,
  controlValues: Record<string, unknown> | null
): StepIssuesDto {
  const issues: StepIssuesDto = {};

  function processNestedControlValues(currentValue: unknown, currentPath: string[] = []) {
    if (!currentValue || typeof currentValue !== 'object') {
      const liquidTemplateIssues = buildVariables(variableSchema, currentValue);

      if (liquidTemplateIssues.invalidVariables.length > 0) {
        const controlKey = currentPath.join('.');
        issues.controls = issues.controls || {};

        issues.controls[controlKey] = liquidTemplateIssues.invalidVariables.map((error) => {
          const message = error.message
            ? error.message[0].toUpperCase() + error.message.slice(1).split(' line:')[0]
            : '';

          return {
            message: `${message} variable: ${error.output}`,
            issueType: StepContentIssueEnum.ILLEGAL_VARIABLE_IN_CONTROL_VALUE,
            variableName: error.output,
          };
        });
      }

      return;
    }

    for (const [key, value] of Object.entries(currentValue)) {
      processNestedControlValues(value, [...currentPath, key]);
    }
  }

  processNestedControlValues(controlValues);

  return issues;
}

function processControlValuesBySchema(
  controlSchema: JSONSchemaDto | undefined,
  controlValues: Record<string, unknown> | null
): StepIssuesDto {
  let issues: StepIssuesDto = {};

  if (!controlSchema || !controlValues) {
    return issues;
  }

  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);
  const validate = ajv.compile(controlSchema);
  const isValid = validate(controlValues);
  const errors = validate.errors as null | ErrorObject[];

  if (!isValid && errors && errors?.length !== 0 && controlValues) {
    issues = {
      controls: errors.reduce(
        (acc, error) => {
          const path = getErrorPath(error);
          if (!acc[path]) {
            acc[path] = [];
          }
          acc[path].push({
            message: mapAjvErrorToMessage(error),
            issueType: mapAjvErrorToIssueType(error),
            variableName: path,
          });

          return acc;
        },
        {} as Record<string, ContentIssue[]>
      ),
    };

    return issues;
  }

  return issues;
}

/*
 * Extracts the path from the error object:
 * 1. If instancePath exists, removes leading slash and converts remaining slashes to dots
 * 2. If no instancePath, uses missingProperty from error params
 * Example: "/foo/bar" becomes "foo.bar"
 */
function getErrorPath(error: ErrorObject): string {
  const path = error.instancePath.substring(1);
  const { missingProperty } = error.params;

  if (!path || path.trim().length === 0) {
    return missingProperty;
  }

  const fullPath = missingProperty ? `${path}/${missingProperty}` : path;

  return fullPath?.replace(/\//g, '.');
}

function frameworkSanitizeEmptyStringsToNull(
  obj: Record<string, unknown> | undefined | null
): Record<string, unknown> | undefined | null {
  if (typeof obj !== 'object' || obj === null || obj === undefined) return obj;

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (typeof value === 'string' && value.trim() === '') {
        return [key, null];
      }
      if (typeof value === 'object') {
        return [key, frameworkSanitizeEmptyStringsToNull(value as Record<string, unknown>)];
      }

      return [key, value];
    })
  );
}

function mapAjvErrorToIssueType(error: ErrorObject): StepContentIssueEnum {
  switch (error.keyword) {
    case 'required':
      return StepContentIssueEnum.MISSING_VALUE;
    case 'type':
      return StepContentIssueEnum.MISSING_VALUE;
    default:
      return StepContentIssueEnum.MISSING_VALUE;
  }
}

function mapAjvErrorToMessage(error: ErrorObject<string, Record<string, unknown>, unknown>): string {
  if (error.keyword === 'required') {
    return `${_.capitalize(error.params.missingProperty)} is required`;
  }
  if (
    error.keyword === 'pattern' &&
    error.message?.includes('must match pattern') &&
    error.message?.includes('mailto') &&
    error.message?.includes('https')
  ) {
    return 'Invalid URL format. Must be a valid absolute URL, path, or valid variable';
  }

  return error.message || 'Invalid value';
}
