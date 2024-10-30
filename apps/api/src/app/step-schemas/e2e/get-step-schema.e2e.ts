import { expect } from 'chai';

import { UserSession } from '@novu/testing';
import { CreateWorkflowDto, StepTypeEnum, WorkflowCreationSourceEnum, WorkflowResponseDto } from '@novu/shared';

describe('Get Step Schema - /steps?workflowId=:workflowId&stepId=:stepId&stepType=:stepType (GET)', async () => {
  let session: UserSession;
  let createdWorkflow: WorkflowResponseDto;

  beforeEach(async () => {
    session = new UserSession();
    await session.initialize();
  });
  // todo: need to add test for variable logic.
  describe('Get Control Schema with stepType', () => {
    it('should get step schema for in app step type', async function () {
      const { data } = (await getStepSchema({ session, stepType: StepTypeEnum.IN_APP })).body;

      const { controls, variables } = data;
      const { schema, uiSchema } = controls;

      expect(schema.type).to.equal('object');
      expect(schema.properties).to.have.property('subject');
      expect(schema.properties.subject.type).to.equal('string');
      expect(schema.properties).to.have.property('body');
      expect(schema.properties.body.type).to.equal('string');
      expect(schema.properties).to.have.property('avatar');
      expect(schema.properties.avatar.type).to.equal('string');
      expect(schema.properties.avatar.format).to.equal('uri');
      expect(schema.properties).to.have.property('primaryAction');
      expect(schema.properties.primaryAction.type).to.equal('object');
      expect(schema.properties.primaryAction.properties).to.have.property('label');
      expect(schema.properties.primaryAction.properties.label.type).to.equal('string');
      expect(schema.properties.primaryAction.properties).to.have.property('redirect');
      expect(schema.properties.primaryAction.properties.redirect.type).to.equal('object');
      expect(schema.properties.primaryAction.required).to.deep.equal(['label']);
      expect(schema.properties).to.have.property('secondaryAction');
      expect(schema.properties.secondaryAction.type).to.equal('object');
      expect(schema.properties.secondaryAction.properties).to.have.property('label');
      expect(schema.properties.secondaryAction.properties.label.type).to.equal('string');
      expect(schema.properties.secondaryAction.properties).to.have.property('redirect');
      expect(schema.properties.secondaryAction.properties.redirect.type).to.equal('object');
      expect(schema.properties.secondaryAction.required).to.deep.equal(['label']);
      expect(schema.properties).to.have.property('data');
      expect(schema.properties.data.type).to.equal('object');
      expect(schema.properties.data.additionalProperties).to.be.true;
      expect(schema.properties).to.have.property('redirect');
      expect(schema.properties.redirect.type).to.equal('object');
      expect(schema.properties.redirect.properties).to.have.property('url');
      expect(schema.properties.redirect.properties.url.type).to.equal('string');
      expect(schema.properties.redirect.properties).to.have.property('target');
      expect(schema.properties.redirect.properties.target.type).to.equal('string');
      expect(schema.required).to.deep.equal(['body']);
      expect(schema.additionalProperties).to.be.false;
      expect(schema.description).to.not.be.empty;

      expect(uiSchema.type).to.equal('in_app');
      expect(uiSchema.properties.subject.type).to.equal('inAppSubject');
      expect(uiSchema.properties.body.type).to.equal('inAppBody');
      expect(uiSchema.properties.avatar.type).to.equal('inAppAvatar');
      expect(uiSchema.properties.primaryAction.type).to.equal('inAppPrimaryAction');
      expect(uiSchema.properties.secondaryAction.type).to.equal('inAppSecondaryAction');
      expect(uiSchema.properties.data.type).to.equal('inAppData');
      expect(uiSchema.properties.redirect.type).to.equal('inAppRedirect');

      expect(variables.type).to.equal('object');
      expect(variables.description).to.not.be.empty;
      expect(variables.properties).to.have.property('subscriber');
      expect(variables.properties.subscriber.type).to.equal('object');
      expect(variables.properties.subscriber.description).to.not.be.empty;
      expect(variables.properties.subscriber.properties).to.have.property('firstName');
      expect(variables.properties.subscriber.properties.firstName.type).to.equal('string');
      expect(variables.properties.subscriber.properties).to.have.property('lastName');
      expect(variables.properties.subscriber.properties.lastName.type).to.equal('string');
      expect(variables.properties.subscriber.properties).to.have.property('email');
      expect(variables.properties.subscriber.properties.email.type).to.equal('string');
      expect(variables.properties.subscriber.required).to.deep.equal([
        'firstName',
        'lastName',
        'email',
        'subscriberId',
      ]);
      expect(variables.properties).to.have.property('steps');
      expect(variables.properties.steps.type).to.equal('object');
      expect(variables.properties.steps.description).to.not.be.empty;
      expect(variables.required).to.deep.equal(['subscriber']);
      expect(variables.additionalProperties).to.be.false;
    });

    it('should get error for invalid step type', async function () {
      const response = await getStepSchema({ session, stepType: 'invalid' as StepTypeEnum });

      expect(response.status).to.equal(400);
      expect(response.body.message).to.include(
        'stepType must be one of the following values: email, sms, push, chat, in_app, digest, delay, custom'
      );
      expect(response.body.statusCode).to.equal(400);
    });
  });
});

async function createWorkflow(session: UserSession, createdWorkflow: WorkflowResponseDto) {
  const workflowObject: CreateWorkflowDto = {
    __source: WorkflowCreationSourceEnum.ONBOARDING_IN_APP,
    name: 'test api template',
    workflowId: 'test-trigger-api',
    description: 'This is a test description',
    tags: ['test-tag-api'],
    steps: [
      {
        name: 'In-App Test Step',
        type: StepTypeEnum.IN_APP,
        controlValues: {},
      },
      {
        name: 'SMS Test Step',
        type: StepTypeEnum.SMS,
        controlValues: {},
      },
    ],
  };

  const workflowDataRes = await session.testAgent.post(`/v2/workflows`).send(workflowObject);

  return workflowDataRes.body.data;
}

const getStepSchema = async ({
  session,
  workflowId,
  stepId,
  stepType,
}: {
  session: UserSession;
  workflowId?: string;
  stepId?: string;
  stepType?: StepTypeEnum;
}) => {
  const queryParams = new URLSearchParams();
  if (workflowId) queryParams.append('workflowId', workflowId);
  if (stepId) queryParams.append('stepId', stepId);
  if (stepType) queryParams.append('stepType', stepType);

  return await session.testAgent.get(`/v1/steps?${queryParams.toString()}`);
};
