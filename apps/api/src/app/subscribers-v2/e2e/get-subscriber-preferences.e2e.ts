import { expect } from 'chai';
import { randomBytes } from 'crypto';
import { UserSession } from '@novu/testing';
import { ChannelTypeEnum, IGetSubscriberResponseDto } from '@novu/shared';
import { NotificationTemplateEntity } from '@novu/dal';
import {
  UpdateSubscriberGlobalPreferencesRequestDto,
  UpdateSubscriberPreferenceRequestDto,
} from '@novu/api/models/components';

const v2Prefix = '/v2';
let session: UserSession;

describe('Get Subscriber Preferences - /subscribers/:subscriberId/preferences (GET) #novu-v2', () => {
  let subscriber: IGetSubscriberResponseDto;
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

  it('should handle subscriber with modified workflow preferences', async () => {
    // created workflow has 'email' and 'in-app'  channels enabled by default
    const workflowId = workflow._id;

    // disable email channel for this workflow
    const enableEmailPreferenceData: UpdateSubscriberPreferenceRequestDto = {
      channel: {
        type: ChannelTypeEnum.EMAIL,
        enabled: false,
      },
    };

    // TODO: replace with v2 endpoint when available
    await session.testAgent
      .patch(`/v1/subscribers/${subscriber.subscriberId}/preferences/${workflowId}`)
      .send({ ...enableEmailPreferenceData });

    const response = await session.testAgent.get(`${v2Prefix}/subscribers/${subscriber.subscriberId}/preferences`);

    const { global, workflows } = response.body.data;

    expect(response.statusCode).to.equal(200);

    expect(global.channels).to.deep.equal({ in_app: true, email: true });
    expect(workflows).to.have.lengthOf(1);
    expect(workflows[0].channels).to.deep.equal({ in_app: true, email: false });
    expect(workflows[0].workflow).to.deep.equal({ name: workflow.name, identifier: workflow.triggers[0].identifier });
  });

  it('should handle subscriber with modified global preferences', async () => {
    // disable email channel globally
    const enableGlobalEmailPreferenceData: UpdateSubscriberGlobalPreferencesRequestDto = {
      preferences: [
        {
          type: ChannelTypeEnum.EMAIL,
          enabled: false,
        },
      ],
    };

    // TODO: replace with v2 endpoint when available
    await session.testAgent
      .patch(`/v1/subscribers/${subscriber.subscriberId}/preferences`)
      .send({ ...enableGlobalEmailPreferenceData });

    const response = await session.testAgent.get(`${v2Prefix}/subscribers/${subscriber.subscriberId}/preferences`);

    const { global, workflows } = response.body.data;

    expect(response.statusCode).to.equal(200);

    expect(global.channels).to.deep.equal({ in_app: true, email: false });
    expect(workflows).to.have.lengthOf(1);
    expect(workflows[0].channels).to.deep.equal({ in_app: true, email: false });
    expect(workflows[0].workflow).to.deep.equal({ name: workflow.name, identifier: workflow.triggers[0].identifier });
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
