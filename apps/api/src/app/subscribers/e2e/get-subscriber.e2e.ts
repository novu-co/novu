import { expect } from 'chai';
import { UserSession } from '@novu/testing';

describe('Get Subscriber - /subscribers/:id (GET)', function () {
  let session: UserSession;

  beforeEach(async () => {
    session = new UserSession();
    await session.initialize();
  });

  it('should return a subscriber by id', async function () {
    await session.testAgent.post('/v1/subscribers').send({
      subscriberId: 'sub_42',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@doe.com',
      phone: '+5555555555',
    });

    const response = await session.testAgent.get('/v1/subscribers/sub_42');

    const { data: subscriber } = response.body;
    expect(subscriber.subscriberId).to.equal('sub_42');
    expect(subscriber.topics).to.be.undefined;
  });

  it('should return a subscriber with their topics', async function () {
    await session.testAgent.post('/v1/subscribers').send({
      subscriberId: 'sub_42',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@doe.com',
      phone: '+5555555555',
    });

    await session.testAgent.post('/v1/topics').send({
      key: 'top_42',
      name: 'My Topic',
    });

    await session.testAgent.post('/v1/topics/top_42/subscribers').send({
      subscribers: ['sub_42'],
    });

    const response = await session.testAgent.get('/v1/subscribers/sub_42?includeTopics=true');

    const { data: subscriber } = response.body;
    expect(subscriber.subscriberId).to.equal('sub_42');
    expect(subscriber.topics).to.eql(['top_42']);
  });
});
