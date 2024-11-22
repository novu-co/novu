import { type Types } from 'mongoose';

import { type EnvironmentId, type OrganizationId, type TopicId, type TopicKey, type TopicName } from './types';

export class TopicEntity {
  _id: TopicId;
  _environmentId: EnvironmentId;
  _organizationId: OrganizationId;
  key: TopicKey;
  name: TopicName;
}

export type TopicDBModel = Omit<TopicEntity, '_environmentId' | '_organizationId'> & {
  _environmentId: Types.ObjectId;

  _organizationId: Types.ObjectId;
};
