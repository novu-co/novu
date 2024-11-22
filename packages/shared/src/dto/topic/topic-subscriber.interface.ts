import {
  type EnvironmentId,
  type ExternalSubscriberId,
  type OrganizationId,
  type SubscriberId,
  type TopicId,
  type TopicKey,
} from '../../types';

export interface ITopicSubscriber {
  _organizationId: OrganizationId;

  _environmentId: EnvironmentId;

  _subscriberId: SubscriberId;

  _topicId: TopicId;

  topicKey: TopicKey;

  externalSubscriberId: ExternalSubscriberId;
}
