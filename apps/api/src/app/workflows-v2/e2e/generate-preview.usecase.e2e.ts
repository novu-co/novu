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
import { NotificationTemplateEntity, NotificationTemplateRepository } from '@novu/dal';

const TEST_WORKFLOW_NAME = 'Test Workflow Name';

type Context = { name: string; payloadSource: 'requestBody' | 'payloadSchema' };
const contexts: Context[] = [
  { name: 'payload in request body', payloadSource: 'requestBody' },
  { name: 'payload stored in payloadSchema', payloadSource: 'payloadSchema' },
];

describe('Workflow Step Preview - POST /:workflowId/step/:stepId/preview', () => {
  let session: UserSession;
  let workflowsClient: ReturnType<typeof createWorkflowClient>;
  const notificationTemplateRepository = new NotificationTemplateRepository();

  beforeEach(async () => {
    session = new UserSession();
    await session.initialize();

    workflowsClient = createWorkflowClient(session.serverUrl, {
      Authorization: session.token,
      'Novu-Environment-Id': session.environment._id,
    });
  });

  contexts.forEach((context: Context) => {
    describe(`Preview [context: ${context.name}]`, () => {
      it('should generate preview for in-app step with valid control values', async () => {
        const pay = {
          type: 'object',
          properties: {
            firstName: {
              type: 'string',
            },
            lastName: {
              type: 'string',
            },
            organizationName: {
              type: 'string',
            },
          },
        };
        const payloadSchema = context.payloadSource === 'payloadSchema' ? pay : undefined;
        const workflow = await createWorkflow({ payloadSchema });

        const stepId = workflow.steps[0]._id;
        const controlValues = {
          subject: 'Welcome {{payload.firstName}}',
          body: 'Hello {{payload.firstName}} {{payload.lastName}}, Welcome to {{payload.organizationName | upcase}}!',
        };

        const previewPayload = {
          payload: {
            firstName: 'John',
            lastName: 'Doe',
            organizationName: 'Novu',
          },
        };

        const { status, body } = await session.testAgent
          .post(`/v2/workflows/${workflow._id}/step/${stepId}/preview`)
          .send({
            controlValues,
            previewPayload,
          });

        expect(status).to.equal(201);
        expect(body).to.deep.equal({
          data: {
            result: {
              preview: {
                subject: 'Welcome John',
                body: 'Hello John Doe, Welcome to NOVU!',
              },
              type: 'in_app',
            },
            previewPayloadExample: {
              payload: {
                firstName: 'John',
                lastName: 'Doe',
                organizationName: 'Novu',
              },
            },
          },
        });
      });

      it('should handle preview with missing required payload variables', async () => {
        const pay = {
          type: 'object',
          properties: {
            orderId: {
              type: 'string',
            },
            lastName: {
              type: 'string',
            },
            organizationName: {
              type: 'string',
            },
          },
        };
        const payloadSchema = context.payloadSource === 'payloadSchema' ? pay : undefined;
        const workflow = await createWorkflow({ payloadSchema });

        const stepId = workflow.steps[0]._id;
        const controlValues = {
          subject: 'Welcome {{payload.firstName}}',
          body: 'Hello {{payload.firstName}}, your order #{{payload.orderId}} is ready!',
        };

        const response = await session.testAgent.post(`/v2/workflows/${workflow._id}/step/${stepId}/preview`).send({
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
        const pay = {
          type: 'object',
          properties: {
            orderId: {
              type: 'string',
            },
            userName: {
              type: 'string',
            },
            organizationName: {
              type: 'string',
            },
          },
        };
        const payloadSchema = context.payloadSource === 'payloadSchema' ? pay : undefined;
        const workflow = await createWorkflow({ payloadSchema });

        const stepId = workflow.steps[0]._id;
        const controlValues = {
          subject: 'Order {{payload.orderId}}',
          body: 'Hello {{payload.userName}}',
        };

        const response = await session.testAgent.post(`/v2/workflows/${workflow._id}/step/${stepId}/preview`).send({
          controlValues,
        });

        expect(response.status).to.equal(201);
        expect(response.body.data).to.deep.equal({
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
        const pay = {
          type: 'object',
          properties: {
            firstName: {
              type: 'string',
            },
            lastName: {
              type: 'string',
            },
            organizationName: {
              type: 'string',
            },
          },
        };
        const payloadSchema = context.payloadSource === 'payloadSchema' ? pay : undefined;
        const workflow = await createWorkflow({ payloadSchema });

        const nonExistentWorkflowId = 'non-existent-id';
        const stepId = workflow.steps[0]._id;

        const response = await session.testAgent
          .post(`/v2/workflows/${nonExistentWorkflowId}/step/${stepId}/preview`)
          .send({
            controlValues: {},
          });

        expect(response.status).to.equal(404);
        expect(response.body.message).to.contain('Workflow cannot be found');
      });

      it('should return 400 for non-existent step', async () => {
        const pay = {
          type: 'object',
          properties: {
            firstName: {
              type: 'string',
            },
            lastName: {
              type: 'string',
            },
            organizationName: {
              type: 'string',
            },
          },
        };
        const payloadSchema = context.payloadSource === 'payloadSchema' ? pay : undefined;
        const workflow = await createWorkflow({ payloadSchema });
        const nonExistentStepId = 'non-existent-step-id';

        const response = await session.testAgent
          .post(`/v2/workflows/${workflow._id}/step/${nonExistentStepId}/preview`)
          .send({
            controlValues: {},
          });

        expect(response.status).to.equal(400);
        expect(response.body.message).to.contain('No step found');
      });
    });
  });

  async function createWorkflow(overrides: Partial<NotificationTemplateEntity> = {}): Promise<WorkflowResponseDto> {
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
    };

    const res = await workflowsClient.createWorkflow(createWorkflowDto);
    if (!res.isSuccessResult()) {
      throw new Error(res.error!.responseText);
    }

    await notificationTemplateRepository.updateOne(
      {
        _organizationId: session.organization._id,
        _environmentId: session.environment._id,
        _id: res.value._id,
      },
      {
        ...overrides,
      }
    );

    if (!res.value) {
      throw new Error('Workflow not found');
    }

    return res.value;
  }
});
