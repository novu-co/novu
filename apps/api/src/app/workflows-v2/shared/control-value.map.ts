import { ControlValuesEntity } from '@novu/dal';
import { ValidatedContentResponse } from '../usecases/validate-content';

export type InternalStepId = string;

export type ControlValuesMap = { [p: InternalStepId]: ControlValuesEntity };

export type ValidatedContentMap = Record<InternalStepId, ValidatedContentResponse>;
