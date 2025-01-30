import { expect } from 'chai';
import { randomBytes } from 'crypto';
import { UserSession } from '@novu/testing';
import { NotificationTemplateEntity } from '@novu/dal';
import { SubscriberResponseDto } from '@novu/api/models/components';

const v2Prefix = '/v2';
let session: UserSession;

describe('Get Subscriber Preferences - /subscribers/:subscriberId/preferences (GET) #novu-v2', () => {
  let subscriber: SubscriberResponseDto;
  let workflow: NotificationTemplateEntity;

  beforeEach(async () => {
    const uuid = randomBytes(4).toString('hex');
    session = new UserSession();
    await session.initialize();
    subscriber = await createSubscriberAndValidate(uuid);
    workflow = await session.createTemplate({
      noFeedId: true,
    });
  });

  it('should fetch subscriber preferences with default values', async () => {
    const response = await session.testAgent.get(`${v2Prefix}/subscribers/${subscriber.subscriberId}/preferences`);

    expect(response.statusCode).to.equal(200);
    expect(response.body.data).to.have.property('global');
    expect(response.body.data).to.have.property('workflows');

    const { global, workflows } = response.body.data;

    // Validate global preferences
    expect(global).to.have.property('enabled');
    expect(global).to.have.property('channels');
    expect(global.enabled).to.be.true;

    // Validate workflows array
    expect(workflows).to.be.an('array');
  });

  it('should return 404 if subscriber does not exist', async () => {
    const invalidSubscriberId = `non-existent-${randomBytes(2).toString('hex')}`;
    const response = await session.testAgent.get(`${v2Prefix}/subscribers/${invalidSubscriberId}/preferences`);

    expect(response.statusCode).to.equal(404);
  });

  it('should show all available templates in preferences response', async () => {
    // Create multiple templates
    const workflow2 = await session.createTemplate({ noFeedId: true });
    const workflow3 = await session.createTemplate({ noFeedId: true });

    const response = await session.testAgent.get(`${v2Prefix}/subscribers/${subscriber.subscriberId}/preferences`);

    expect(response.statusCode).to.equal(200);
    const { workflows } = response.body.data;

    expect(workflows).to.have.lengthOf(3); // Should show all available templates
    const templateIds = workflows.map((_wf) => _wf.workflow.identifier);
    expect(templateIds).to.include(workflow.triggers[0].identifier);
    expect(templateIds).to.include(workflow2.triggers[0].identifier);
    expect(templateIds).to.include(workflow3.triggers[0].identifier);
  });

  it('should inherit channel preferences from global settings when no workflow override exists', async () => {
    // First set global preferences
    await session.testAgent.patch(`${v2Prefix}/subscribers/${subscriber.subscriberId}/preferences`).send({
      channels: {
        email: false,
        in_app: true,
      },
    });

    // Then create a new template
    const newWorkflow = await session.createTemplate({ noFeedId: true });

    // Check preferences
    const response = await session.testAgent.get(`${v2Prefix}/subscribers/${subscriber.subscriberId}/preferences`);

    expect(response.statusCode).to.equal(200);
    const { workflows } = response.body.data;

    const newWorkflowPrefs = workflows.find((_wf) => _wf.workflow.identifier === newWorkflow.triggers[0].identifier);
    // New workflow should inherit global settings
    expect(newWorkflowPrefs.channels).to.deep.equal({ email: false, in_app: true });
  });
});

async function createSubscriberAndValidate(id: string = '') {
  const payload = {
    subscriberId: `test-subscriber-${id}`,
    firstName: `Test ${id}`,
    lastName: 'Subscriber',
    email: `test-${id}@subscriber.com`,
    phone: '+1234567890',
  };

  const res = await session.testAgent.post(`/v1/subscribers`).send(payload);
  expect(res.status).to.equal(201);

  const subscriber = res.body.data;

  expect(subscriber.subscriberId).to.equal(payload.subscriberId);
  expect(subscriber.firstName).to.equal(payload.firstName);
  expect(subscriber.lastName).to.equal(payload.lastName);
  expect(subscriber.email).to.equal(payload.email);
  expect(subscriber.phone).to.equal(payload.phone);

  return subscriber;
}
