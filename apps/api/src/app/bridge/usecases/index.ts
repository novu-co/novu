import { UpsertControlValuesUseCase } from '@novu/application-generic';
import { GetBridgeStatus } from './get-bridge-status';
import { PreviewStep } from './preview-step';
import { StoreControlValuesUseCase } from './store-control-values';
import { Sync } from './sync';

export const USECASES = [GetBridgeStatus, PreviewStep, StoreControlValuesUseCase, Sync, UpsertControlValuesUseCase];
