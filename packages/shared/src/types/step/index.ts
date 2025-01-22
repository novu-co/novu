import { StepIssuesDto } from '../../dto/workflows/step.dto';
import { IMessageTemplate } from '../../entities/message-template';
import { IWorkflowStepMetadata } from '../../entities/step';
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
  uuid?: string;
  name?: string;
  active?: boolean;
  filters?: IStepFilter[];
  metadata?:
    | IEmailMetadata
    | IPushMetadata
    | ISmsMetadata
    | IChatMetadata
    | IInAppMetadata
    | IThrottleMetadata
    | IWorkflowStepMetadata;
  shouldStopOnFail?: boolean;
  replyCallback?: {
    active: boolean;
    url: string;
  };
  _templateId?: string;
  _parentId?: string | null;
  stepId?: string;
  issues?: StepIssuesDto;
  template?: IMessageTemplate;
}
