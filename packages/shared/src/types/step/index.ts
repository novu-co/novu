import { BuilderFieldType, BuilderGroupValues, FilterParts } from '../builder';

export interface IStepFilter {
  isNegated?: boolean;
  type?: BuilderFieldType;
  value: BuilderGroupValues;
  children: FilterParts[];
}

export interface IEmailMetadata {
  type: 'email';
  subject?: string;
  preheader?: string;
  senderName?: string;
}

export interface IPushMetadata {
  type: 'push';
  title?: string;
  sound?: string;
}

export interface ISmsMetadata {
  type: 'sms';
}

export interface IChatMetadata {
  type: 'chat';
}

export interface IInAppMetadata {
  type: 'in_app';
  avatar?: string;
  title?: string;
  description?: string;
}

export interface IThrottleMetadata {
  type: 'throttle';
  amount: number;
  timeUnit: 'seconds' | 'minutes' | 'hours' | 'days';
  timeValue: number;
}

export interface IStepVariant {
  _id?: string;
  uuid: string;
  name: string;
  active?: boolean;
  filters?: IStepFilter[];
  metadata?: IEmailMetadata | IPushMetadata | ISmsMetadata | IChatMetadata | IInAppMetadata | IThrottleMetadata;
  shouldStopOnFail?: boolean;
  replyCallback?: {
    active: boolean;
    url: string;
  };
}
