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
} from '../../types';

export interface ILayoutEntity {
  _id?: LayoutId;
  _organizationId: OrganizationId;
  _environmentId: EnvironmentId;
  _creatorId: UserId;
  _parentId?: LayoutId;
  name: LayoutName;
  identifier: LayoutIdentifier;
  channel: ChannelTypeEnum;
  content: string;
  description?: LayoutDescription;
  contentType: string;
  variables?: ITemplateVariable[];
  isDefault: boolean;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}
