import { expect } from 'chai';
import {
  slugify,
  createWorkflowClient,
  CreateWorkflowDto,
  WorkflowCreationSourceEnum,
  WorkflowResponseDto,
  StepTypeEnum,
} from '@novu/shared';
import { UserSession } from '@novu/testing';

const TEST_WORKFLOW_NAME = 'Test Workflow Name';

describe('Workflow Step Preview - POST /:workflowId/step/:stepId/preview', () => {
  let session: UserSession;
  let workflowsClient: ReturnType<typeof createWorkflowClient>;
  let workflowCreated: WorkflowResponseDto;

  beforeEach(async () => {
    session = new UserSession();
    await session.initialize();

    workflowsClient = createWorkflowClient(session.serverUrl, {
      Authorization: session.token,
      'Novu-Environment-Id': session.environment._id,
    });

    workflowCreated = await createWorkflowAndValidate();
  });

  it('should generate preview for in-app step with valid control values', async () => {
    const stepId = workflowCreated.steps[0]._id;
    const controlValues = {
      subject: 'Welcome {{payload.firstName}}',
      body: 'Hello {{payload.firstName}} {{payload.lastName}}, Welcome to {{organizationName}}!',
    };

    const previewPayload = {
      payload: {
        firstName: 'John',
        lastName: 'Doe',
      },
    };

    const { status, body } = await session.testAgent
      .post(`/v2/workflows/${workflowCreated._id}/step/${stepId}/preview`)
      .send({
        controlValues,
        previewPayload,
      });

    expect(status).to.equal(201);
    expect(body).to.deep.equal({
      data: {
        issues: {
          body: [
            {
              issueType: 'ILLEGAL_VARIABLE_IN_CONTROL_VALUE',
              variableName: '{{organizationName}}',
              message: 'Illegal variable in control value: {{organizationName}}',
            },
          ],
        },
        result: {
          preview: {
            subject: 'Welcome John',
            body: 'Hello John Doe, Welcome to!',
          },
          type: 'in_app',
        },
        previewPayloadExample: {
          payload: {
            firstName: 'John',
            lastName: 'Doe',
          },
        },
      },
    });
  });

  it('should handle preview with missing required payload variables', async () => {
    const stepId = workflowCreated.steps[0]._id;
    const controlValues = {
      subject: 'Welcome {{payload.firstName}}',
      body: 'Hello {{payload.firstName}}, your order #{{payload.orderId}} is ready!',
    };

    const response = await session.testAgent.post(`/v2/workflows/${workflowCreated._id}/step/${stepId}/preview`).send({
      controlValues,
      previewPayload: {
        payload: {
          firstName: 'John',
          // orderId is missing
        },
      },
    });

    expect(response.status).to.equal(201);
    expect(response.body.data.result.preview.body).to.contain('{{payload.orderId}}');
    expect(response.body.data.previewPayloadExample).to.have.nested.property('payload.orderId');
  });

  it('should handle preview with external workflow origin', async () => {
    const externalWorkflow = await createWorkflowAndValidate();
    const stepId = externalWorkflow.steps[0]._id;
    const controlValues = {
      subject: 'Order {{payload.orderId}}',
      body: 'Hello {{payload.userName}}',
    };

    const response = await session.testAgent.post(`/v2/workflows/${externalWorkflow._id}/step/${stepId}/preview`).send({
      controlValues,
    });

    expect(response.status).to.equal(201);
    expect(response.body.data).to.deep.equal({
      issues: {},
      result: {
        preview: {
          subject: 'Order {{payload.orderId}}',
          body: 'Hello {{payload.userName}}',
        },
        type: 'in_app',
      },
      previewPayloadExample: {
        payload: {
          orderId: '{{payload.orderId}}',
          userName: '{{payload.userName}}',
        },
      },
    });
  });

  it('should return 404 for non-existent workflow', async () => {
    const nonExistentWorkflowId = 'non-existent-id';
    const stepId = workflowCreated.steps[0]._id;

    const response = await session.testAgent
      .post(`/v2/workflows/${nonExistentWorkflowId}/step/${stepId}/preview`)
      .send({
        controlValues: {},
      });

    expect(response.status).to.equal(404);
    expect(response.body.message).to.contain('Workflow cannot be found');
  });

  it('should return 400 for non-existent step', async () => {
    const nonExistentStepId = 'non-existent-step-id';

    const response = await session.testAgent
      .post(`/v2/workflows/${workflowCreated._id}/step/${nonExistentStepId}/preview`)
      .send({
        controlValues: {},
      });

    expect(response.status).to.equal(400);
    expect(response.body.message).to.contain('No step found');
  });

  async function createWorkflowAndValidate(overrides: Partial<CreateWorkflowDto> = {}): Promise<WorkflowResponseDto> {
    const createWorkflowDto: CreateWorkflowDto = {
      __source: WorkflowCreationSourceEnum.EDITOR,
      name: TEST_WORKFLOW_NAME,
      workflowId: `${slugify(TEST_WORKFLOW_NAME)}`,
      description: 'This is a test workflow',
      active: true,
      steps: [
        {
          name: 'In-App Test Step',
          type: StepTypeEnum.IN_APP,
        },
        {
          name: 'Email Test Step',
          type: StepTypeEnum.EMAIL,
        },
      ],
      ...overrides,
    };

    const res = await workflowsClient.createWorkflow(createWorkflowDto);
    if (!res.isSuccessResult()) {
      throw new Error(res.error!.responseText);
    }

    return res.value;
  }
});
