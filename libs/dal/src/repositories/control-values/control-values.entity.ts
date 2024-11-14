import { ControlValuesLevelEnum } from '@novu/shared';

type ControlKey = string;
type ControlValue = unknown;
export type ControlsKeyValue = Record<ControlKey, ControlValue>;

export class ControlValuesEntity {
  _id: string;
  createdAt: string;
  updatedAt: string;
  _environmentId: string;
  _organizationId: string;
  level: ControlValuesLevelEnum;
  priority: number;
  controls: ControlsKeyValue;
  _workflowId: string;
  _stepId: string;
}
