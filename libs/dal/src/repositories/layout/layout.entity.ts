import {
  type ChannelTypeEnum,
  type EnvironmentId,
  type ITemplateVariable,
  type LayoutDescription,
  type LayoutId,
  type LayoutIdentifier,
  type LayoutName,
  type OrganizationId,
  type UserId,
} from './types';
import type { ChangePropsValueType } from '../../types/helpers';

export class LayoutEntity {
  _id: LayoutId;
  _environmentId: EnvironmentId;
  _organizationId: OrganizationId;
  _creatorId: UserId;
  _parentId?: LayoutId;
  name: LayoutName;
  identifier: LayoutIdentifier;
  description?: LayoutDescription;
  variables?: ITemplateVariable[];
  content: string;
  contentType: 'customHtml';
  isDefault: boolean;
  deleted: boolean;
  channel: ChannelTypeEnum;
  createdAt?: string;
  updatedAt?: string;
}

export type LayoutDBModel = ChangePropsValueType<
  LayoutEntity,
  '_environmentId' | '_organizationId' | '_creatorId' | '_parentId'
>;
