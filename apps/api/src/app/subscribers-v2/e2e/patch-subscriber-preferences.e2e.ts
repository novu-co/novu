import { expect } from 'chai';
import { randomBytes } from 'crypto';
import { UserSession } from '@novu/testing';
import { NotificationTemplateEntity } from '@novu/dal';
import { SubscriberResponseDto } from '@novu/api/models/components';
import { PatchSubscriberPreferencesDto } from '../dtos/patch-subscriber-preferences.dto';

const v2Prefix = '/v2';
let session: UserSession;

describe('Patch Subscriber Preferences - /subscribers/:subscriberId/preferences (PATCH) #novu-v2', () => {
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

  it('should patch workflow channel preferences', async () => {
    const workflowId = workflow._id;
    const patchData: PatchSubscriberPreferencesDto = {
      channels: {
        email: false,
        in_app: true,
      },
      workflowId,
    };

    const response = await session.testAgent
      .patch(`${v2Prefix}/subscribers/${subscriber.subscriberId}/preferences`)
      .send(patchData);

    expect(response.statusCode).to.equal(200);
    expect(response.body.data).to.have.property('workflows');

    const { global, workflows } = response.body.data;

    expect(global.channels).to.deep.equal({ in_app: true, email: true });
    expect(workflows).to.have.lengthOf(1);
    expect(workflows[0].channels).to.deep.equal({ in_app: true, email: false });
    expect(workflows[0].workflow).to.deep.equal({ name: workflow.name, identifier: workflow.triggers[0].identifier });
  });

  it('should patch global channel preferences', async () => {
    const patchData: PatchSubscriberPreferencesDto = {
      channels: {
        email: false,
        in_app: false,
      },
    };

    const response = await session.testAgent
      .patch(`${v2Prefix}/subscribers/${subscriber.subscriberId}/preferences`)
      .send(patchData);

    expect(response.statusCode).to.equal(200);
    expect(response.body.data).to.have.property('global');
    expect(response.body.data).to.have.property('workflows');

    const { global, workflows } = response.body.data;

    expect(global.channels).to.deep.equal({ in_app: false, email: false });
    expect(workflows).to.have.lengthOf(1);
    expect(workflows[0].channels).to.deep.equal({ in_app: false, email: false });
    expect(workflows[0].workflow).to.deep.equal({ name: workflow.name, identifier: workflow.triggers[0].identifier });
  });

  it('should return 404 when patching non-existent subscriber preferences', async () => {
    const invalidSubscriberId = `non-existent-${randomBytes(2).toString('hex')}`;
    const patchData: PatchSubscriberPreferencesDto = {
      channels: {
        email: false,
      },
    };

    const response = await session.testAgent
      .patch(`${v2Prefix}/subscribers/${invalidSubscriberId}/preferences`)
      .send(patchData);

    expect(response.statusCode).to.equal(404);
  });

  it('should return 400 when patching with invalid workflow id', async () => {
    const patchData: PatchSubscriberPreferencesDto = {
      channels: {
        email: false,
      },
      workflowId: 'invalid-workflow-id',
    };

    const response = await session.testAgent
      .patch(`${v2Prefix}/subscribers/${subscriber.subscriberId}/preferences`)
      .send(patchData);

    expect(response.statusCode).to.equal(400);
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
