import type { ContentIssue, StepIssue } from '../../dto/workflows/step.dto';
import type { BuilderFieldType, BuilderGroupValues, CustomDataType, FilterParts, WorkflowTypeEnum } from '../../types';
import { IStepVariant } from '../../types/step';
import { INotificationGroup } from '../notification-group';
import { INotificationBridgeTrigger, INotificationTrigger } from '../notification-trigger';
import { IPreferenceChannels } from '../subscriber-preference';

export interface INotificationTemplate {
  _id?: string;
  name: string;
  description?: string;
  _notificationGroupId: string;
  _parentId?: string;
  _environmentId: string;
  tags: string[];
  draft?: boolean;
  active: boolean;
  critical: boolean;
  preferenceSettings: IPreferenceChannels;
  createdAt?: string;
  updatedAt?: string;
  steps: INotificationTemplateStep[] | INotificationBridgeTrigger[];
  triggers: INotificationTrigger[];
  isBlueprint?: boolean;
  blueprintId?: string;
  type?: WorkflowTypeEnum;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payloadSchema?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawData?: any;
  data?: CustomDataType;
}

export class IGroupedBlueprint {
  name: string;
  blueprints: IBlueprint[];
}

export interface IBlueprint extends INotificationTemplate {
  notificationGroup: INotificationGroup;
}

export class StepIssues {
  body?: Record<string, StepIssue>;
  controls?: Record<string, ContentIssue[]>;
}

export interface INotificationTemplateStep extends IStepVariant {
  variants?: IStepVariant[];
}

export interface IMessageFilter {
  isNegated?: boolean;
  type?: BuilderFieldType;
  value: BuilderGroupValues;
  children: FilterParts[];
}
