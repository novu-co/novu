import type {
  ControlSchemas,
  EnvironmentId,
  IActor,
  IMessageCTA,
  IMessageTemplate,
  JSONSchemaDto,
  MessageTemplateContentType,
  OrganizationId,
  StepTypeEnum,
} from '@novu/shared';

import { IEmailBlock, ITemplateVariable } from './types';
import type { ChangePropsValueType } from '../../types/helpers';

export class MessageTemplateEntity implements IMessageTemplate {
  _id?: string;

  _environmentId: EnvironmentId;

  _organizationId: OrganizationId;

  _creatorId: string;

  // TODO: Due a circular dependency I can't import LayoutId from Layout.
  _layoutId?: string | null;

  type: StepTypeEnum;

  variables?: ITemplateVariable[];

  content: string | IEmailBlock[];

  contentType?: MessageTemplateContentType;

  active?: boolean;

  subject?: string;

  title?: string;

  name?: string;

  stepId?: string;

  preheader?: string;

  senderName?: string;

  _feedId?: string;

  cta?: IMessageCTA;

  _parentId?: string;

  actor?: IActor;

  deleted?: boolean;

  controls?: ControlSchemas;

  output?: {
    schema: JSONSchemaDto;
  };

  code?: string;
}

export type MessageTemplateDBModel = ChangePropsValueType<
  MessageTemplateEntity,
  '_environmentId' | '_organizationId' | '_creatorId' | '_layoutId' | '_feedId' | '_parentId'
>;
