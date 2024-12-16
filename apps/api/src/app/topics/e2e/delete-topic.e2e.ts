import { SubscribersService, UserSession } from '@novu/testing';
import { expect } from 'chai';

import { Novu } from '@novu/api';
import { expectSdkExceptionGeneric, initNovuClassSdk } from '../../shared/helpers/e2e/sdk/e2e-sdk.helper';
import { addSubscribers, createTopic, getTopic } from './helpers/topic-e2e-helper';

const BASE_PATH = '/v1/topics';

describe('Delete a topic - /topics/:topicKey (DELETE)', async () => {
  let session: UserSession;
  let novuClient: Novu;

  before(async () => {
    session = new UserSession();
    await session.initialize();
    novuClient = initNovuClassSdk(session);
  });

  it('should delete the topic requested by its key', async () => {
    const topicKey = 'topic-key-deletion';
    const topicName = 'topic-name-deletion';
    const topicCreated = await createTopic(session, topicKey, topicName);

    const topicRetrieved = await getTopic(session, topicCreated._id, topicKey, topicName);
    expect(topicRetrieved).to.be.ok;
    await novuClient.topics.delete(topicKey);
    const { error } = await expectSdkExceptionGeneric(() => novuClient.topics.retrieve(topicKey));
    expect(error).to.be.ok;
    if (error) {
      expect(error.statusCode).to.equal(404);
      expect(error.message).to.eql(`Topic not found for id ${topicKey} in the environment ${session.environment._id}`);
      expect(error.ctx?.error).to.eql('Not Found');
    }
  });

  it('should throw a not found error when trying to delete a topic that does not exist', async () => {
    const nonExistingTopicKey = 'ab12345678901234567890ab';
    const { error } = await expectSdkExceptionGeneric(() => novuClient.topics.delete(nonExistingTopicKey));
    expect(error).to.be.ok;
    if (error) {
      expect(error.statusCode).to.equal(404);
      expect(error.message).to.eql(
        `Topic not found for id ${nonExistingTopicKey} in the environment ${session.environment._id}`
      );
    }
  });

  it('should throw a conflict error when trying to delete a topic with subscribers assigned', async () => {
    const topicKey = 'topic-key-deletion-with-subscribers';
    const topicName = 'topic-name-deletion-with-subscribers';
    const topicCreated = await createTopic(session, topicKey, topicName);

    const topicRetrieved = await getTopic(session, topicCreated._id, topicKey, topicName);
    expect(topicRetrieved).to.be.ok;

    const subscriberService = new SubscribersService(session.organization._id, session.environment._id);
    const subscriber = await subscriberService.createSubscriber();

    await addSubscribers(session, topicKey, [subscriber.subscriberId]);

    const { body } = await session.testAgent.delete(`${BASE_PATH}/${topicKey}`);

    expect(body.statusCode).to.equal(409);
    expect(body.message).to.eql(
      `Topic with key ${topicKey} in the environment ${session.environment._id} can't be deleted as it still has subscribers assigned`
    );
    expect(body.error).to.eql('Conflict');
  });
});
