import { ChannelTypeEnum } from '../../types';
import { ISubscriberFeedResponseDto } from '../subscriber';
import { IActorDto, IMessageCTADto } from '../message-template';

export interface INotificationDto {
  _id: string;
  _templateId: string;
  _environmentId: string;
  _messageTemplateId: string;
  _organizationId: string;
  _notificationId: string;
  _subscriberId: string;
  _feedId?: string | null;
  _jobId: string;
  createdAt: string;
  updatedAt?: string | null;
  lastSeenDate?: string;
  lastReadDate?: string;
  actor?: IActorDto;
  subscriber?: ISubscriberFeedResponseDto;
  transactionId: string;
  templateIdentifier?: string | null;
  providerId?: string | null;
  content: string;
  channel: ChannelTypeEnum;
  read: boolean;
  seen: boolean;
  subject?: string | null;
  deleted: boolean;
  deviceTokens?: string[] | null;
  cta: IMessageCTADto;
  status: 'sent' | 'error' | 'warning';
  payload?: Record<string, unknown>;
  overrides?: Record<string, unknown>;
}
