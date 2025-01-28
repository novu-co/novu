import { expect } from 'chai';
import { randomBytes } from 'crypto';
import { UserSession } from '@novu/testing';
import { IGetSubscriberResponseDto } from '@novu/shared';

const v2Prefix = '/v2';
let session: UserSession;

describe('Update Subscriber - /subscribers/:subscriberId (PATCH) #novu-v3', () => {
  let subscriber: IGetSubscriberResponseDto;

  beforeEach(async () => {
    const uuid = randomBytes(4).toString('hex');
    session = new UserSession();
    await session.initialize();
    subscriber = await createSubscriberAndValidate(uuid);
  });

  it('should update the fields of the subscriber', async () => {
    const payload = {
      firstName: 'Updated First Name',
      lastName: 'Updated Last Name',
    };

    const res = await session.testAgent.patch(`${v2Prefix}/subscribers/${subscriber.subscriberId}`).send(payload);

    expect(res.statusCode).to.equal(200);
    const updatedSubscriber = res.body.data;

    expect(subscriber.firstName).to.not.equal(updatedSubscriber.firstName);
    expect(updatedSubscriber.firstName).to.equal(payload.firstName);
    expect(subscriber.lastName).to.not.equal(updatedSubscriber.lastName);
    expect(updatedSubscriber.lastName).to.equal(payload.lastName);

    expect(subscriber.subscriberId).to.equal(updatedSubscriber.subscriberId);
    expect(subscriber.email).to.equal(updatedSubscriber.email);
    expect(subscriber.phone).to.equal(updatedSubscriber.phone);
  });

  it('should return 404 if subscriberId does not exist', async () => {
    const payload = {
      firstName: 'Updated First Name',
      lastName: 'Updated Last Name',
    };

    const invalidSubscriberId = `non-existent-${randomBytes(2).toString('hex')}`;
    const response = await session.testAgent.patch(`${v2Prefix}/subscribers/${invalidSubscriberId}`).send(payload);

    expect(response.statusCode).to.equal(404);
  });

  it('should return the original subscriber if no fields are updated', async () => {
    const res = await session.testAgent.patch(`${v2Prefix}/subscribers/${subscriber.subscriberId}`).send({});

    expect(res.statusCode).to.equal(200);
    const updatedSubscriber = res.body.data;

    expect(subscriber.firstName).to.equal(updatedSubscriber.firstName);
    expect(subscriber.lastName).to.equal(updatedSubscriber.lastName);
    expect(subscriber.email).to.equal(updatedSubscriber.email);
    expect(subscriber.phone).to.equal(updatedSubscriber.phone);
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
