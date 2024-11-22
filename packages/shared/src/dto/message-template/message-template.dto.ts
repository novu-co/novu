import { type MessageTemplateContentType } from '../../entities/message-template';
import { type IMessageCTA } from '../../entities/messages';

import {
  type ActorTypeEnum,
  type ChannelCTATypeEnum,
  type IEmailBlock,
  type ITemplateVariable,
  type StepTypeEnum,
} from '../../types';

export class ChannelCTADto {
  type: ChannelCTATypeEnum;

  data: {
    url: string;
  };
}

export class MessageTemplateDto {
  type: StepTypeEnum;

  content: string | IEmailBlock[];

  contentType?: MessageTemplateContentType;

  cta?: IMessageCTA;

  actor?: {
    type: ActorTypeEnum;
    data: string | null;
  };

  variables?: ITemplateVariable[];

  feedId?: string;

  layoutId?: string | null;

  name?: string;

  subject?: string;

  title?: string;

  preheader?: string;

  senderName?: string;

  _creatorId?: string;
}
