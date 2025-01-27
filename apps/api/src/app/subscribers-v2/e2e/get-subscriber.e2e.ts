import { expect } from 'chai';
import { randomBytes } from 'crypto';
import { UserSession } from '@novu/testing';
import { IGetSubscriberResponseDto } from '@novu/shared';

const v2Prefix = '/v2';
let session: UserSession;

describe('Get Subscriber - /subscribers/:subscriberId (GET) #novu-v2', () => {
  let subscriber: IGetSubscriberResponseDto;

  beforeEach(async () => {
    const uuid = randomBytes(4).toString('hex');
    session = new UserSession();
    await session.initialize();
    subscriber = await createSubscriberAndValidate(uuid);
  });

  it('should fetch subscriber by subscriberId', async () => {
    const res = await session.testAgent.get(`${v2Prefix}/subscribers/${subscriber.subscriberId}`);

    expect(res.statusCode).to.equal(200);

    validateSubscriber(res.body.data, subscriber);
  });

  it('should return 404 if subscriberId does not exist', async () => {
    const invalidSubscriberId = `non-existent-${randomBytes(2).toString('hex')}`;
    const response = await session.testAgent.get(`${v2Prefix}/subscribers/${invalidSubscriberId}`);

    expect(response.statusCode).to.equal(404);
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

  validateSubscriber(subscriber, payload);

  return subscriber;
}

function validateSubscriber(subscriber: IGetSubscriberResponseDto, expected: Partial<IGetSubscriberResponseDto>) {
  expect(subscriber.subscriberId).to.equal(expected.subscriberId);
  expect(subscriber.firstName).to.equal(expected.firstName);
  expect(subscriber.lastName).to.equal(expected.lastName);
  expect(subscriber.email).to.equal(expected.email);
  expect(subscriber.phone).to.equal(expected.phone);
}
