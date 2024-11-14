import { ControlValuesEntity } from '@novu/dal';

type StepInternalId = string;
export type ControlValuesMap = { [p: StepInternalId]: ControlValuesEntity };
