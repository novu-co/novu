import {
  PreferencesTypeEnum,
  WorkflowPreferences,
  WorkflowPreferencesPartial,
} from '@novu/shared';

export class GetPreferencesResponseDto {
  preferences: WorkflowPreferences;

  type: PreferencesTypeEnum;

  source: Record<PreferencesTypeEnum, WorkflowPreferencesPartial | null>;
}
