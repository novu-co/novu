import { expect } from 'chai';
import { UserSession } from '@novu/testing';
import { randomBytes } from 'crypto';
import {
  createWorkflowClient,
  CreateWorkflowDto,
  DEFAULT_WORKFLOW_PREFERENCES,
  isStepUpdateBody,
  ListWorkflowResponse,
  PreferencesRequestDto,
  ShortIsPrefixEnum,
  slugify,
  StepContentIssueEnum,
  StepCreateDto,
  StepIssueEnum,
  StepResponseDto,
  StepTypeEnum,
  StepUpdateDto,
  UpdateStepBody,
  UpdateWorkflowDto,
  UpsertStepBody,
  UpsertWorkflowBody,
  WorkflowCommonsFields,
  WorkflowCreationSourceEnum,
  WorkflowIssueTypeEnum,
  WorkflowListResponseDto,
  WorkflowOriginEnum,
  WorkflowResponseDto,
  WorkflowStatusEnum,
} from '@novu/shared';

import { encodeBase62 } from '../shared/helpers';
import { stepTypeToDefaultDashboardControlSchema } from './shared';
import { getTestControlValues } from './generate-preview.e2e';

const v2Prefix = '/v2';
const PARTIAL_UPDATED_NAME = 'Updated';
const TEST_WORKFLOW_UPDATED_NAME = `${PARTIAL_UPDATED_NAME} Workflow Name`;
const TEST_WORKFLOW_NAME = 'Test Workflow Name';

const TEST_TAGS = ['test'];
let session: UserSession;

const LONG_DESCRIPTION = `XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`;
describe('Workflow Controller E2E API Testing', () => {
  let workflowsClient: ReturnType<typeof createWorkflowClient>;

  beforeEach(async () => {
    session = new UserSession();
    await session.initialize();
    workflowsClient = createWorkflowClient(session.serverUrl, getHeaders());
  });
  function getHeaders(overrideEnv?: string): HeadersInit {
    return {
      Authorization: session.token, // Fixed space
      'Novu-Environment-Id': overrideEnv || session.environment._id,
    };
  }

  it('Smoke Testing', async () => {
    const workflowCreated = await createWorkflowAndValidate();
    await getWorkflowAndValidate(workflowCreated);
    const updateRequest = buildUpdateRequest(workflowCreated);
    await updateWorkflowAndValidate(workflowCreated._id, workflowCreated.updatedAt, updateRequest);
    await updateWorkflowAndValidate(workflowCreated._id, workflowCreated.updatedAt, {
      ...updateRequest,
      description: 'Updated Description',
    });
    await getAllAndValidate({ searchQuery: PARTIAL_UPDATED_NAME, expectedTotalResults: 1, expectedArraySize: 1 });
    await deleteWorkflowAndValidateDeletion(workflowCreated._id);
  });

  describe('Error Handling', () => {
    describe('Should show status ok when no problems', () => {
      it('should show status ok when no problems', async () => {
        const workflowCreated = await createWorkflowAndValidate();
        await getWorkflowAndValidate(workflowCreated);
      });
    });
    describe('Workflow Body Issues', () => {
      it('should show description issue when too long', async () => {
        const issues = await createWorkflowAndReturnIssues({ description: LONG_DESCRIPTION });
        expect(issues?.description).to.be.ok;
        if (issues?.description) {
          expect(issues?.description[0]?.issueType, JSON.stringify(issues)).to.be.equal(
            WorkflowIssueTypeEnum.MAX_LENGTH_ACCESSED
          );
        }
      });
    });
    describe('Workflow Step Body Issues', () => {
      it('should show name issue when missing', async () => {
        const { issues, status } = await createWorkflowAndReturnStepIssues(
          { steps: [{ ...buildEmailStep(), name: '' }] },
          0
        );
        expect(status).to.be.equal(WorkflowStatusEnum.ERROR);
        expect(issues).to.be.ok;
        if (issues.body) {
          expect(issues.body).to.be.ok;
          expect(issues.body.name).to.be.ok;
          expect(issues.body.name?.issueType, JSON.stringify(issues)).to.be.equal(StepIssueEnum.MISSING_REQUIRED_VALUE);
        }
      });
    });
    describe('Workflow Step content Issues', () => {
      it('should show control value required when missing', async () => {
        const { issues, status } = await createWorkflowAndReturnStepIssues(
          { steps: [{ ...buildEmailStep(), controlValues: {} }] },
          0
        );
        expect(status, JSON.stringify(issues)).to.equal(WorkflowStatusEnum.ERROR);
        expect(issues).to.be.ok;
        if (issues.controls) {
          expect(issues.controls?.emailEditor).to.be.ok;
          if (issues.controls?.emailEditor) {
            expect(issues.controls?.emailEditor[0].issueType).to.be.equal(StepContentIssueEnum.MISSING_VALUE);
          }
        }
      });
    });
  });
  describe('Create Workflow Permutations', () => {
    it('should allow creating two workflows for the same user with the same name', async () => {
      const nameSuffix = `Test Workflow${new Date().toString()}`;
      await createWorkflowAndValidate(nameSuffix);
      const createWorkflowDto: CreateWorkflowDto = buildCreateWorkflowDto(nameSuffix);
      const res = await workflowsClient.createWorkflow(createWorkflowDto);
      expect(res.isSuccessResult()).to.be.true;
      if (res.isSuccessResult()) {
        const workflowCreated: WorkflowResponseDto = res.value;
        expect(workflowCreated.workflowId).to.include(`${slugify(nameSuffix)}-`);
        await assertValuesInSteps(workflowCreated);
      }
    });
  });

  describe('Update Workflow Permutations', () => {
    it('should update control values', async () => {
      const nameSuffix = `Test Workflow${new Date().toString()}`;
      const workflowCreated: WorkflowResponseDto = await createWorkflowAndValidate(nameSuffix);
      const updateRequest: UpdateWorkflowDto = {
        name: workflowCreated.name,
        preferences: {
          user: null,
        },
        steps: prepareStepsForUpdateWithNewValues(workflowCreated.steps),
        workflowId: workflowCreated.workflowId,
      };
      const updatedWorkflow: WorkflowResponseDto = await updateWorkflowRest(
        workflowCreated._id,
        updateRequest as UpdateWorkflowDto
      );
      const workflowId = updatedWorkflow._id;
      const stepId = updatedWorkflow.steps[0]._id;
      expect(updateRequest.steps[0]?.controlValues?.test).to.be.equal(
        (await getControlValuesForStep(workflowId, stepId))?.test
      );
      const stepId1 = updatedWorkflow.steps[1]._id;
      expect(updateRequest.steps[1]?.controlValues?.test).to.be.equal(
        (await getControlValuesForStep(workflowId, stepId1))?.test
      );
    });

    it('should keep the step id on updated ', async () => {
      const nameSuffix = `Test Workflow${new Date().toString()}`;
      const workflowCreated: WorkflowResponseDto = await createWorkflowAndValidate(nameSuffix);
      const updateDto = convertResponseToUpdateDto(workflowCreated);
      const updatedWorkflow = await updateWorkflowRest(workflowCreated._id, updateDto);
      const updatedStep = updatedWorkflow.steps[0];
      const originalStep = workflowCreated.steps[0];
      expect(updatedStep._id).to.be.ok;
      expect(updatedStep._id).to.be.equal(originalStep._id);
    });

    it('adding user preferences', async () => {
      const nameSuffix = `Test Workflow${new Date().toString()}`;
      const workflowCreated: WorkflowResponseDto = await createWorkflowAndValidate(nameSuffix);
      const updateDto = convertResponseToUpdateDto(workflowCreated);
      const updatedWorkflow = await updateWorkflowRest(workflowCreated._id, {
        ...updateDto,
        preferences: {
          user: { ...DEFAULT_WORKFLOW_PREFERENCES, all: { ...DEFAULT_WORKFLOW_PREFERENCES.all, enabled: false } },
        },
      });
      expect(updatedWorkflow.preferences.user, JSON.stringify(updatedWorkflow, null, 2)).to.be.ok;
      expect(updatedWorkflow.preferences?.user?.all.enabled, JSON.stringify(updatedWorkflow, null, 2)).to.be.false;

      const updatedWorkflow2 = await updateWorkflowRest(workflowCreated._id, {
        ...updateDto,
        preferences: {
          user: null,
        },
      });
      expect(updatedWorkflow2.preferences.user).to.be.null;
      expect(updatedWorkflow2.preferences.default).to.be.ok;
    });

    it('should update by slugify ids', async () => {
      const nameSuffix = `Test Workflow${new Date().toString()}`;
      const workflowCreated: WorkflowResponseDto = await createWorkflowAndValidate(nameSuffix);
      const updateDtoWithValues = buildUpdateDto(workflowCreated);

      const internalId = workflowCreated._id;
      await updateWorkflowAndValidate(internalId, workflowCreated.updatedAt, updateDtoWithValues);

      const slugPrefixAndEncodedInternalId = `workflow-name-${ShortIsPrefixEnum.WORKFLOW}${encodeBase62(internalId)}`;
      await updateWorkflowAndValidate(slugPrefixAndEncodedInternalId, workflowCreated.updatedAt, updateDtoWithValues);

      const { workflowId } = workflowCreated;
      await updateWorkflowAndValidate(workflowId, workflowCreated.updatedAt, updateDtoWithValues);
    });
  });

  describe('List Workflow Permutations', () => {
    it('should not return workflows with if not matching query', async () => {
      await createWorkflowAndValidate('XYZ');
      await createWorkflowAndValidate('XYZ2');
      const workflowSummaries = await getAllAndValidate({
        searchQuery: 'ABC',
        expectedTotalResults: 0,
        expectedArraySize: 0,
      });
      expect(workflowSummaries).to.be.empty;
    });

    it('should not return workflows if offset is bigger than the amount of available workflows', async () => {
      const uuid = generateUUID();
      await create10Workflows(uuid);
      await getAllAndValidate({
        searchQuery: uuid,
        offset: 11,
        limit: 15,
        expectedTotalResults: 10,
        expectedArraySize: 0,
      });
    });

    it('should return all results within range', async () => {
      const uuid = generateUUID();

      await create10Workflows(uuid);
      await getAllAndValidate({
        searchQuery: uuid,
        offset: 0,
        limit: 15,
        expectedTotalResults: 10,
        expectedArraySize: 10,
      });
    });

    it('should return results without query', async () => {
      const uuid = generateUUID();
      await create10Workflows(uuid);
      await getAllAndValidate({
        searchQuery: uuid,
        offset: 0,
        limit: 15,
        expectedTotalResults: 10,
        expectedArraySize: 10,
      });
    });

    it('page workflows without overlap', async () => {
      const uuid = generateUUID();
      await create10Workflows(uuid);
      const listWorkflowResponse1 = await getAllAndValidate({
        searchQuery: uuid,
        offset: 0,
        limit: 5,
        expectedTotalResults: 10,
        expectedArraySize: 5,
      });
      const listWorkflowResponse2 = await getAllAndValidate({
        searchQuery: uuid,
        offset: 5,
        limit: 5,
        expectedTotalResults: 10,
        expectedArraySize: 5,
      });
      const idsDeduplicated = buildIdSet(listWorkflowResponse1, listWorkflowResponse2);
      expect(idsDeduplicated.size).to.be.equal(10);
    });
  });

  describe('Promote Workflow Permutations', () => {
    it('should promote by creating a new workflow in production environment with the same properties', async () => {
      // Create a workflow in the development environment
      const devWorkflow = await createWorkflowAndValidate('-promote-workflow');

      // Switch to production environment and get its ID
      const devEnvironmentId = session.environment._id;
      await session.switchToProdEnvironment();
      const prodEnvironmentId = session.environment._id;
      await session.switchToDevEnvironment();

      // Promote the workflow to production
      const prodWorkflow = await syncWorkflow(devWorkflow, prodEnvironmentId);

      // Verify that the promoted workflow has a new ID but the same workflowId
      expect(prodWorkflow._id).to.not.equal(devWorkflow._id);
      expect(prodWorkflow.workflowId).to.equal(devWorkflow.workflowId);

      // Check that all non-environment-specific properties are identical
      const propertiesToCompare = ['name', 'description', 'tags', 'preferences', 'status', 'type', 'origin'];
      propertiesToCompare.forEach((prop) => {
        expect(prodWorkflow[prop]).to.deep.equal(devWorkflow[prop], `Property ${prop} should match`);
      });

      // Verify that steps are correctly promoted
      expect(prodWorkflow.steps).to.have.lengthOf(devWorkflow.steps.length);
      for (const prodStep of prodWorkflow.steps) {
        const index = prodWorkflow.steps.indexOf(prodStep);
        const devStep = devWorkflow.steps[index];
        /*
         * TODO: this is not true yet, but some ID will remain the same across environments
         * expect(prodStep.stepId).to.equal(devStep.stepId, 'Step ID should be the same');
         */
        const prodValues = await getWorkflowStepControlValues(prodWorkflow, prodStep, prodEnvironmentId);

        const devValues = await getWorkflowStepControlValues(devWorkflow, devStep, devEnvironmentId);
        expect(prodValues).to.deep.equal(devValues, 'Step controlValues should match');
        expect(prodStep.name).to.equal(devStep.name, 'Step name should match');
        expect(prodStep.type).to.equal(devStep.type, 'Step type should match');
      }
    });

    it('should promote by updating an existing workflow in production environment', async () => {
      // Switch to production environment and get its ID
      await session.switchToProdEnvironment();
      const prodEnvironmentId = session.environment._id;
      await session.switchToDevEnvironment();

      // Create a workflow in the development environment
      const devWorkflow = await createWorkflowAndValidate('-promote-workflow');

      // Promote the workflow to production
      const resPromoteCreate = await session.testAgent.put(`${v2Prefix}/workflows/${devWorkflow._id}/sync`).send({
        targetEnvironmentId: prodEnvironmentId,
      });
      expect(resPromoteCreate.status).to.equal(200);
      const prodWorkflowCreated = resPromoteCreate.body.data;

      // Update the workflow in the development environment
      const stepToUpdate = removeFields(devWorkflow.steps[0], 'stepId');
      const updateDto = {
        ...convertResponseToUpdateDto(devWorkflow),
        name: 'Updated Name',
        description: 'Updated Description',
        // modify existing Email Step, add new InApp Steps, previously existing InApp Step is removed
        steps: [
          { ...stepToUpdate, name: 'Updated Email Step' },
          { ...buildInAppStep(), name: 'New InApp Step' },
        ],
      };
      await updateWorkflowAndValidate(devWorkflow._id, devWorkflow.updatedAt, updateDto);

      // Promote the updated workflow to production
      const resPromoteUpdate = await session.testAgent.put(`${v2Prefix}/workflows/${devWorkflow._id}/sync`).send({
        targetEnvironmentId: prodEnvironmentId,
      });

      expect(resPromoteUpdate.status).to.equal(200);
      const prodWorkflowUpdated = resPromoteUpdate.body.data;

      // Verify that IDs remain unchanged
      expect(prodWorkflowUpdated._id).to.equal(prodWorkflowCreated._id);
      expect(prodWorkflowUpdated.workflowId).to.equal(prodWorkflowCreated.workflowId);

      // Verify updated properties
      expect(prodWorkflowUpdated.name).to.equal('Updated Name');
      expect(prodWorkflowUpdated.description).to.equal('Updated Description');

      // Verify unchanged properties
      ['status', 'type', 'origin'].forEach((prop) => {
        expect(prodWorkflowUpdated[prop]).to.deep.equal(prodWorkflowCreated[prop], `Property ${prop} should match`);
      });

      // Verify updated steps
      expect(prodWorkflowUpdated.steps).to.have.lengthOf(2);
      expect(prodWorkflowUpdated.steps[0].name).to.equal('Updated Email Step');
      expect(prodWorkflowUpdated.steps[0]._id).to.equal(prodWorkflowCreated.steps[0]._id);
      expect(prodWorkflowUpdated.steps[0].stepId).to.equal(prodWorkflowCreated.steps[0].stepId);
      expect(prodWorkflowUpdated.steps[1].name).to.equal('New InApp Step');

      // Verify new created step
      expect(prodWorkflowUpdated.steps[1]._id).to.not.equal(prodWorkflowCreated.steps[1]._id);
      expect(prodWorkflowUpdated.steps[1].stepId).to.equal('new-inapp-step');
    });

    it('should throw an error if trying to promote to the same environment', async () => {
      const devWorkflow = await createWorkflowAndValidate('-promote-workflow');

      const res = await session.testAgent.put(`${v2Prefix}/workflows/${devWorkflow._id}/sync`).send({
        targetEnvironmentId: session.environment._id,
      });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('Cannot sync workflow to the same environment');
    });

    it('should throw an error if the workflow to promote is not found', async () => {
      const res = await session.testAgent.put(`${v2Prefix}/workflows/123/sync`).send({ targetEnvironmentId: '123' });

      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal('Workflow cannot be found');
      expect(res.body.workflowId).to.equal('123');
    });
  });

  describe('Get Workflow Permutations', () => {
    it('should get by slugify ids', async () => {
      const workflowCreated = await createWorkflowAndValidate('XYZ');

      const internalId = workflowCreated._id;
      const workflowRetrievedByInternalId = await getWorkflowRest(internalId);
      expect(workflowRetrievedByInternalId._id).to.equal(internalId);

      const base62InternalId = encodeBase62(internalId);
      const slugPrefixAndEncodedInternalId = `my-workflow-${ShortIsPrefixEnum.WORKFLOW}${base62InternalId}`;
      const workflowRetrievedBySlugPrefixAndEncodedInternalId = await getWorkflowRest(slugPrefixAndEncodedInternalId);
      expect(workflowRetrievedBySlugPrefixAndEncodedInternalId._id).to.equal(internalId);

      const workflowIdentifier = workflowCreated.workflowId;
      const workflowRetrievedByWorkflowIdentifier = await getWorkflowRest(workflowIdentifier);
      expect(workflowRetrievedByWorkflowIdentifier._id).to.equal(internalId);
    });

    it('should return 404 if workflow does not exist', async () => {
      const notExistingId = '123';
      const novuRestResult = await workflowsClient.getWorkflow(notExistingId);
      expect(novuRestResult.isSuccess).to.be.false;
      expect(novuRestResult.error).to.be.ok;
      expect(novuRestResult.error!.status).to.equal(404);
      expect(novuRestResult.error!.responseText).to.contain('Workflow');
      expect(JSON.parse(novuRestResult.error!.responseText).workflowId).to.contain(notExistingId);
    });
  });

  describe('Get Steps Permutations', () => {
    it('should get by worflow slugify ids', async () => {
      const workflowCreated = await createWorkflowAndValidate('XYZ');
      const internalWorkflowId = workflowCreated._id;
      const stepId = workflowCreated.steps[0]._id;

      const stepRetrievedByWorkflowInternalId = await getStepData(internalWorkflowId, stepId);
      expect(stepRetrievedByWorkflowInternalId._id).to.equal(stepId);

      const base62WorkflowIdInternalId = encodeBase62(internalWorkflowId);
      const slugPrefixAndEncodedWorkflowInternalId = `my-workflow-${ShortIsPrefixEnum.WORKFLOW}${base62WorkflowIdInternalId}`;
      const stepRetrievedBySlugPrefixAndEncodedWorkflowInternalId = await getStepData(
        slugPrefixAndEncodedWorkflowInternalId,
        stepId
      );
      expect(stepRetrievedBySlugPrefixAndEncodedWorkflowInternalId._id).to.equal(stepId);

      const workflowIdentifier = workflowCreated.workflowId;
      const stepRetrievedByWorkflowIdentifier = await getStepData(workflowIdentifier, stepId);
      expect(stepRetrievedByWorkflowIdentifier._id).to.equal(stepId);
    });

    it('should get by step slugify ids', async () => {
      const workflowCreated = await createWorkflowAndValidate('XYZ');
      const internalWorkflowId = workflowCreated._id;
      const stepId = workflowCreated.steps[0]._id;

      const stepRetrievedByStepInternalId = await getStepData(internalWorkflowId, stepId);
      expect(stepRetrievedByStepInternalId._id).to.equal(stepId);

      const base62StepIdInternalId = encodeBase62(stepId);
      const slugPrefixAndEncodedStepId = `my-step-${ShortIsPrefixEnum.STEP}${base62StepIdInternalId}`;
      const stepRetrievedBySlugPrefixAndEncodedStepId = await getStepData(
        internalWorkflowId,
        slugPrefixAndEncodedStepId
      );
      expect(stepRetrievedBySlugPrefixAndEncodedStepId._id).to.equal(stepId);

      const stepIdentifier = workflowCreated.steps[0].stepId;
      const stepRetrievedByStepIdentifier = await getStepData(internalWorkflowId, stepIdentifier);
      expect(stepRetrievedByStepIdentifier._id).to.equal(stepId);
    });

    it('should get step payload variables', async () => {
      const steps = [
        {
          ...buildEmailStep(),
          controlValues: {
            body: 'Welcome to our newsletter {{bodyText}}{{bodyText2}}{{payload.prefixBodyText}}',
            subject: 'Welcome to our newsletter {{subjectText}} {{payload.prefixSubjectText}}',
          },
        },
        { ...buildInAppStep(), controlValues: { subject: 'Welcome to our newsletter {{inAppSubjectText}}' } },
      ];
      const createWorkflowDto: CreateWorkflowDto = buildCreateWorkflowDto('', { steps });
      const res = await session.testAgent.post(`${v2Prefix}/workflows`).send(createWorkflowDto);
      expect(res.status).to.be.equal(201);
      const workflowCreated: WorkflowResponseDto = res.body.data;
      const stepData = await getStepData(workflowCreated._id, workflowCreated.steps[0]._id);
      const { variables } = stepData;

      if (typeof variables === 'boolean') throw new Error('Variables is not an object');
      const { properties } = variables;
      expect(properties).to.be.ok;
      if (!properties) throw new Error('Payload schema is not valid');

      expect(properties.payload).to.deep.equal({
        type: 'object',
        properties: {
          prefixSubjectText: {
            type: 'string',
            default: '{{payload.prefixSubjectText}}',
          },
          prefixBodyText: {
            type: 'string',
            default: '{{payload.prefixBodyText}}',
          },
        },
      });
    });
  });

  describe('Get Test Data Permutations', () => {
    it('should get test data', async () => {
      const steps = [
        {
          ...buildEmailStep(),
          controlValues: {
            body: 'Welcome to our newsletter {{bodyText}}{{bodyText2}}{{payload.emailPrefixBodyText}}',
            subject: 'Welcome to our newsletter {{subjectText}} {{payload.prefixSubjectText}}',
          },
        },
        { ...buildInAppStep(), controlValues: { subject: 'Welcome to our newsletter {{payload.inAppSubjectText}}' } },
      ];
      const createWorkflowDto: CreateWorkflowDto = buildCreateWorkflowDto('', { steps });
      const res = await session.testAgent.post(`${v2Prefix}/workflows`).send(createWorkflowDto);
      expect(res.status).to.be.equal(201);
      const workflowCreated: WorkflowResponseDto = res.body.data;
      const workflowTestData = await getWorkflowTestData(workflowCreated._id);

      expect(workflowTestData).to.be.ok;
      expect(workflowTestData.payload).to.deep.equal({
        type: 'object',
        properties: {
          emailPrefixBodyText: {
            type: 'string',
            default: '{{payload.emailPrefixBodyText}}',
          },
          prefixSubjectText: {
            type: 'string',
            default: '{{payload.prefixSubjectText}}',
          },
          inAppSubjectText: {
            type: 'string',
            default: '{{payload.inAppSubjectText}}',
          },
        },
      });

      /*
       * Validate the 'to' schema
       * Note: Can't use deep comparison since emails differ between local and CI environments due to user sessions
       */
      const toSchema = workflowTestData.to;
      if (
        typeof toSchema === 'boolean' ||
        typeof toSchema.properties?.subscriberId === 'boolean' ||
        typeof toSchema.properties?.email === 'boolean'
      ) {
        expect((toSchema as any).type).to.be.a('boolean');
        expect(((toSchema as any).properties?.subscriberId as any).type).to.be.a('boolean');
        expect(((toSchema as any).properties?.email as any).type).to.be.a('boolean');
        throw new Error('To schema is not a boolean');
      }
      expect(toSchema.type).to.equal('object');
      expect(toSchema.properties?.subscriberId.type).to.equal('string');
      expect(toSchema.properties?.subscriberId.default).to.equal(session.user._id);
      expect(toSchema.properties?.email.type).to.equal('string');
      expect(toSchema.properties?.email.format).to.equal('email');
      expect(toSchema.properties?.email.default).to.be.a('string');
      expect(toSchema.properties?.email.default).to.not.equal('');
      expect(toSchema.required).to.deep.equal(['subscriberId', 'email']);
      expect(toSchema.additionalProperties).to.be.false;
    });
  });

  async function updateWorkflowRest(id: string, workflow: UpdateWorkflowDto): Promise<WorkflowResponseDto> {
    const novuRestResult = await workflowsClient.updateWorkflow(id, workflow);
    if (novuRestResult.isSuccessResult()) {
      return novuRestResult.value;
    }
    throw new Error(novuRestResult.error!.responseText);
  }

  function constructSlugForStepRequest(stepInRequest: StepUpdateDto) {
    return `${slugify(stepInRequest.name)}_${ShortIsPrefixEnum.STEP}${encodeBase62((stepInRequest as StepUpdateDto)._id)}`;
  }
  async function getControlValuesForStep(workflowId: string, stepId: string) {
    const workflowStepMetadataRestResult = await workflowsClient.getWorkflowStepData(workflowId, stepId);
    if (!workflowStepMetadataRestResult.isSuccessResult()) {
      throw new Error(workflowStepMetadataRestResult.error!.responseText);
    }

    const controlValues = workflowStepMetadataRestResult.value.controls.values;

    return Object.keys(controlValues).length === 0 ? undefined : controlValues;
  }

  function prepareStepsForUpdateWithNewValues(steps: StepResponseDto[]): StepUpdateDto[] {
    const newSteps: StepUpdateDto[] = [];
    for (const step of steps) {
      const newStep: StepUpdateDto = {
        _id: step._id,
        controlValues: { test: randomBytes(10).toString('hex') },
        name: step.name,
        type: step.type,
      };
      newSteps.push(newStep);
    }

    return newSteps;
  }

  async function syncWorkflow(devWorkflow: WorkflowResponseDto, prodEnvironmentId: string) {
    const res = await workflowsClient.syncWorkflow(devWorkflow._id, {
      targetEnvironmentId: prodEnvironmentId,
    });
    if (res.isSuccessResult()) {
      return res.value;
    }
    throw new Error(res.error!.responseText);
  }

  async function getStepData(workflowId: string, stepId: string, envId?: string) {
    const novuRestResult = await createWorkflowClient(session.serverUrl, getHeaders(envId)).getWorkflowStepData(
      workflowId,
      stepId
    );
    if (!novuRestResult.isSuccessResult()) {
      throw new Error(novuRestResult.error!.responseText);
    }
    const { value } = novuRestResult;

    return value;
  }

  async function getWorkflowTestData(workflowId: string, envId?: string) {
    const novuRestResult = await createWorkflowClient(session.serverUrl, getHeaders(envId)).getWorkflowTestData(
      workflowId
    );
    if (!novuRestResult.isSuccessResult()) {
      throw new Error(novuRestResult.error!.responseText);
    }
    const { value } = novuRestResult;

    return value;
  }

  async function getWorkflowStepControlValues(workflow: WorkflowResponseDto, step: StepResponseDto, envId: string) {
    const value = await getStepData(workflow._id, step._id, envId);

    return value.controls.values;
  }
  async function updateWorkflowAndValidate(
    workflowRequestId: string,
    expectedPastUpdatedAt: string,
    updateRequest: UpdateWorkflowDto
  ): Promise<void> {
    const updatedWorkflow: WorkflowResponseDto = await updateWorkflowRest(workflowRequestId, updateRequest);
    const slug = `${slugify(updateRequest.name)}_${ShortIsPrefixEnum.WORKFLOW}${encodeBase62(updatedWorkflow._id)}`;
    expect(updatedWorkflow.slug).to.equal(slug);
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < updateRequest.steps.length; i++) {
      const stepInRequest = updateRequest.steps[i];
      expect(stepInRequest.name).to.equal(updatedWorkflow.steps[i].name);
      expect(stepInRequest.type).to.equal(updatedWorkflow.steps[i].type);
      const persistedValues = await getControlValuesForStep(updatedWorkflow._id, updatedWorkflow.steps[i]._id);
      const valuesInRequest = updateRequest.steps[i].controlValues;
      expect(persistedValues).to.deep.equal(valuesInRequest);
      if ('_id' in stepInRequest) {
        expect(constructSlugForStepRequest(stepInRequest)).to.equal(updatedWorkflow.steps[i].slug);
      }
    }
    expect(convertToDate(updatedWorkflow.updatedAt)).to.be.greaterThan(convertToDate(expectedPastUpdatedAt));
  }
  async function assertValuesInSteps(workflowCreated: WorkflowResponseDto) {
    for (const step of workflowCreated.steps) {
      const stepDataDto = await getStepData(workflowCreated._id, step._id);
      expect(stepDataDto).to.be.ok;
      expect(stepDataDto.controls).to.be.ok;
      if (stepDataDto.controls) {
        expect(stepDataDto.controls.values).to.be.ok;
        expect(stepDataDto.controls.dataSchema).to.be.ok;
        expect(stepDataDto.controls.dataSchema).to.deep.equal(
          stepTypeToDefaultDashboardControlSchema[step.type].schema
        );
        expect(stepDataDto.controls.uiSchema).to.deep.equal(
          stepTypeToDefaultDashboardControlSchema[step.type].uiSchema
        );
      }
    }
  }
  async function create10Workflows(prefix: string) {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < 10; i++) {
      await createWorkflowAndValidate(`${prefix}-ABC${i}`);
    }
  }
  async function createWorkflowAndValidate(nameSuffix: string = ''): Promise<WorkflowResponseDto> {
    const createWorkflowDto: CreateWorkflowDto = buildCreateWorkflowDto(nameSuffix);
    const res = await workflowsClient.createWorkflow(createWorkflowDto);
    if (!res.isSuccessResult()) {
      throw new Error(res.error!.responseText);
    }
    validateCreateWorkflowResponse(res.value, createWorkflowDto);

    return res.value;
  }
  function workflowAsString(workflowResponseDto: any) {
    return JSON.stringify(workflowResponseDto, null, 2);
  }

  function assertWorkflowResponseBodyData(workflowResponseDto: WorkflowResponseDto) {
    expect(workflowResponseDto, workflowAsString(workflowResponseDto)).to.be.ok;
    expect(workflowResponseDto._id, workflowAsString(workflowResponseDto)).to.be.ok;
    expect(workflowResponseDto.updatedAt, workflowAsString(workflowResponseDto)).to.be.ok;
    expect(workflowResponseDto.createdAt, workflowAsString(workflowResponseDto)).to.be.ok;
    expect(workflowResponseDto.preferences, workflowAsString(workflowResponseDto)).to.be.ok;
    expect(workflowResponseDto.status, workflowAsString(workflowResponseDto)).to.be.ok;
    expect(workflowResponseDto.origin, workflowAsString(workflowResponseDto)).to.be.eq(WorkflowOriginEnum.NOVU_CLOUD);
    expect(Object.keys(workflowResponseDto.issues || {}).length, workflowAsString(workflowResponseDto)).to.be.equal(0);
  }

  function assertStepResponse(workflowResponseDto: WorkflowResponseDto, createWorkflowDto: CreateWorkflowDto) {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < workflowResponseDto.steps.length; i++) {
      const stepInRequest = createWorkflowDto.steps[i];
      const step = workflowResponseDto.steps[i];
      expect(step._id, workflowAsString(step)).to.be.ok;
      expect(step.slug, workflowAsString(step)).to.be.ok;
      expect(step.name, workflowAsString(step)).to.be.equal(stepInRequest.name);
      expect(step.type, workflowAsString(step)).to.be.equal(stepInRequest.type);
      expect(Object.keys(step.issues?.body || {}).length, workflowAsString(step)).to.be.eq(0);
    }
  }
  async function createWorkflowAndReturnIssues(overrideDto: Partial<CreateWorkflowDto>) {
    const workflowCreated = await createWorkflowAndReturn(overrideDto);
    const { issues } = workflowCreated;
    expect(issues, JSON.stringify(workflowCreated)).to.be.ok;

    return issues;
  }
  async function createWorkflowAndReturn(
    overrideDto: Partial<
      WorkflowCommonsFields & {
        workflowId: string;
        steps: StepCreateDto[];
        __source: WorkflowCreationSourceEnum;
        preferences?: PreferencesRequestDto;
      }
    >
  ) {
    const createWorkflowDto: CreateWorkflowDto = buildCreateWorkflowDto('nameSuffix');
    const dtoWithoutName = { ...createWorkflowDto, ...overrideDto };

    const res = await workflowsClient.createWorkflow(dtoWithoutName);
    if (!res.isSuccessResult()) {
      throw new Error(res.error!.responseText);
    }
    const workflowCreated: WorkflowResponseDto = res.value;

    return workflowCreated;
  }

  async function createWorkflowAndReturnStepIssues(overrideDto: Partial<CreateWorkflowDto>, stepIndex: number) {
    const workflowCreated = await createWorkflowAndReturn(overrideDto);
    const { steps } = workflowCreated;
    expect(steps, JSON.stringify(workflowCreated)).to.be.ok;
    const step = steps[stepIndex];
    const { issues } = step;
    expect(issues, JSON.stringify(step)).to.be.ok;
    if (issues) {
      return { issues, status: workflowCreated.status };
    }
    throw new Error('Issues not found');
  }
  function validateCreateWorkflowResponse(
    workflowResponseDto: WorkflowResponseDto,
    createWorkflowDto: CreateWorkflowDto
  ) {
    assertWorkflowResponseBodyData(workflowResponseDto);
    assertStepResponse(workflowResponseDto, createWorkflowDto);
  }
});

function buildEmailStep(): StepCreateDto {
  return {
    name: 'Email Test Step',
    type: StepTypeEnum.EMAIL,
    controlValues: getTestControlValues()[StepTypeEnum.EMAIL],
  };
}

function buildInAppStep(): StepCreateDto {
  return {
    name: 'In-App Test Step',
    type: StepTypeEnum.IN_APP,
    controlValues: getTestControlValues()[StepTypeEnum.IN_APP],
  };
}

export function buildCreateWorkflowDto(
  nameSuffix: string,
  overrides: Partial<CreateWorkflowDto> = {}
): CreateWorkflowDto {
  return {
    __source: WorkflowCreationSourceEnum.EDITOR,
    name: TEST_WORKFLOW_NAME + nameSuffix,
    workflowId: `${slugify(TEST_WORKFLOW_NAME + nameSuffix)}`,
    description: 'This is a test workflow',
    active: true,
    tags: TEST_TAGS,
    steps: [buildEmailStep(), buildInAppStep()],
    ...overrides,
  };
}

function convertToDate(dateString: string) {
  const timestamp = Date.parse(dateString);

  return new Date(timestamp);
}

function parseAndReturnJson(res: ApiResponse, url: string) {
  let parse: any;
  try {
    parse = JSON.parse(res.text);
  } catch (e) {
    expect.fail(
      '',
      '',
      `'Expected response to be JSON' text: ${res.text}, url: ${url}, method: ${res.req.method}, status: ${res.status}`
    );
  }
  expect(parse).to.be.ok;

  return parse.data;
}

async function safeRest<T>(
  url: string,
  method: () => Promise<ApiResponse>,
  expectedStatus: number = 200
): Promise<unknown> {
  const res: ApiResponse = await method();
  expect(res.status).to.eq(
    expectedStatus,
    `[${res.req.method}]  Failed for URL: ${url} 
    with text: 
    ${res.text}
     full response:
      ${JSON.stringify(res, null, 2)}`
  ); // Check if the status code is 200

  if (res.status !== 200) {
    return res.text;
  }

  return parseAndReturnJson(res, url);
}

async function getWorkflowRest(workflowId: string): Promise<WorkflowResponseDto> {
  return await safeGet(`${v2Prefix}/workflows/${workflowId}`);
}

async function validateWorkflowDeleted(workflowId: string): Promise<void> {
  await session.testAgent.get(`${v2Prefix}/workflows/${workflowId}`).expect(404);
}

async function getWorkflowAndValidate(workflowCreated: WorkflowResponseDto) {
  const workflowRetrieved = await getWorkflowRest(workflowCreated._id);
  expect(workflowRetrieved).to.deep.equal(workflowCreated);
}

async function getListWorkflows(query: string, offset: number, limit: number): Promise<ListWorkflowResponse> {
  return await safeGet(`${v2Prefix}/workflows?query=${query}&offset=${offset}&limit=${limit}`);
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface AllAndValidate {
  msgPrefix?: string;
  searchQuery: string;
  offset?: number;
  limit?: number;
  expectedTotalResults: number;
  expectedArraySize: number;
}

function buildLogMsg(
  { msgPrefix = '', searchQuery = '', offset = 0, limit = 50, expectedTotalResults, expectedArraySize }: AllAndValidate,
  listWorkflowResponse: ListWorkflowResponse
): string {
  return `Log - msgPrefix: ${msgPrefix}, 
  searchQuery: ${searchQuery}, 
  offset: ${offset}, 
  limit: ${limit}, 
  expectedTotalResults: ${expectedTotalResults ?? 'Not specified'}, 
  expectedArraySize: ${expectedArraySize ?? 'Not specified'}
  response: 
  ${JSON.stringify(listWorkflowResponse || 'Not specified', null, 2)}`;
}

async function getAllAndValidate({
  msgPrefix = '',
  searchQuery = '',
  offset = 0,
  limit = 50,
  expectedTotalResults,
  expectedArraySize,
}: AllAndValidate): Promise<WorkflowListResponseDto[]> {
  const listWorkflowResponse: ListWorkflowResponse = await getListWorkflows(searchQuery, offset, limit);
  const summery: string = buildLogMsg(
    {
      msgPrefix,
      searchQuery,
      offset,
      limit,
      expectedTotalResults,
      expectedArraySize,
    },
    listWorkflowResponse
  );
  expect(listWorkflowResponse.workflows).to.be.an('array', summery);
  expect(listWorkflowResponse.workflows).lengthOf(expectedArraySize, ` workflowSummaries length${summery}`);
  expect(listWorkflowResponse.totalCount).to.be.equal(expectedTotalResults, `total Results don't match${summery}`);

  return listWorkflowResponse.workflows;
}

async function deleteWorkflowRest(_id: string): Promise<void> {
  await safeDelete(`${v2Prefix}/workflows/${_id}`);
}

async function deleteWorkflowAndValidateDeletion(_id: string): Promise<void> {
  await deleteWorkflowRest(_id);
  await validateWorkflowDeleted(_id);
}

function extractIDs(workflowSummaries: WorkflowListResponseDto[]) {
  return workflowSummaries.map((workflow) => workflow._id);
}

function buildIdSet(
  listWorkflowResponse1: WorkflowListResponseDto[],
  listWorkflowResponse2: WorkflowListResponseDto[]
) {
  return new Set([...extractIDs(listWorkflowResponse1), ...extractIDs(listWorkflowResponse2)]);
}

function removeFields<T>(obj: T, ...keysToRemove: (keyof T)[]): T {
  const objCopy = JSON.parse(JSON.stringify(obj));
  keysToRemove.forEach((key) => {
    delete objCopy[key as keyof T];
  });

  return objCopy;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ApiResponse {
  req: {
    method: string; // e.g., "GET"
    url: string; // e.g., "http://127.0.0.1:1337/v1/v2/workflows/66e929c6667852862a1e5145"
    headers: {
      authorization: string; // e.g., "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX5cJ9..."
      'novu-environment-id': string; // e.g., "66e929c6667852862a1e50e4"
    };
  };
  header: {
    'content-security-policy': string;
    'cross-origin-embedder-policy': string;
    'cross-origin-opener-policy': string;
    'cross-origin-resource-policy': string;
    'x-dns-prefetch-control': string;
    'x-frame-options': string;
    'strict-transport-security': string;
    'x-download-options': string;
    'x-content-type-options': string;
    'origin-agent-cluster': string;
    'x-permitted-cross-domain-policies': string;
    'referrer-policy': string;
    'x-xss-protection': string;
    'access-control-allow-origin': string;
    'content-type': string;
    'content-length': string;
    etag: string;
    vary: string;
    date: string;
    connection: string;
  };
  status: number; // e.g., 400
  text: string; // e.g., "{\"message\":\"Workflow not found with id: 66e929c6667852862a1e5145\",\"error\":\"Bad Request\",\"statusCode\":400}"
}

async function safeGet<T>(url: string): Promise<T> {
  return (await safeRest(url, () => session.testAgent.get(url) as unknown as Promise<ApiResponse>)) as T;
}

async function safeDelete<T>(url: string): Promise<void> {
  await safeRest(url, () => session.testAgent.delete(url) as unknown as Promise<ApiResponse>, 204);
}

function generateUUID(): string {
  // Generate a random 4-byte hex string
  const randomHex = () => randomBytes(2).toString('hex');

  // Construct the UUID using the random hex values
  return `${randomHex()}${randomHex()}-${randomHex()}-${randomHex()}-${randomHex()}-${randomHex()}${randomHex()}${randomHex()}`;
}

function addValueToExistingStep(steps: UpsertStepBody[]): UpdateStepBody {
  const stepToUpdate = steps[0];

  if (isStepUpdateBody(stepToUpdate)) {
    stepToUpdate.name = `Updated Step Name- ${generateUUID()}`;
    stepToUpdate.controlValues = { test: `test-${generateUUID()}` };

    return stepToUpdate;
  }

  throw new Error('Step to update is not a StepUpdateDto');
}

function convertResponseToUpdateDto(workflowCreated: WorkflowResponseDto): UpsertWorkflowBody {
  const workflowWithoutResponseFields = removeFields(workflowCreated, 'updatedAt', '_id', 'origin', 'status');
  const steps: UpsertStepBody[] = workflowWithoutResponseFields.steps.map((step) => removeFields(step, 'stepId'));

  return { ...workflowWithoutResponseFields, steps };
}

function buildUpdateDto(workflowCreated: WorkflowResponseDto): UpsertWorkflowBody {
  const updateDto = convertResponseToUpdateDto(workflowCreated);
  const updatedStep = addValueToExistingStep(updateDto.steps);
  const newStep = buildInAppStep();

  return {
    ...updateDto,
    name: `${TEST_WORKFLOW_UPDATED_NAME}-${generateUUID()}`,
    steps: [updatedStep, newStep],
  };
}

function createStep(): StepCreateDto {
  return {
    name: 'someStep',
    type: StepTypeEnum.SMS,
  };
}

function buildUpdateRequest(workflowCreated: WorkflowResponseDto): UpdateWorkflowDto {
  const steps = [createStep()];
  const updateRequest = removeFields(workflowCreated, 'updatedAt', '_id', 'origin', 'status') as UpdateWorkflowDto;

  return {
    ...updateRequest,
    name: TEST_WORKFLOW_UPDATED_NAME,
    steps,
  };
}
