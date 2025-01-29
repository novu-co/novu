import {
  IPreferenceChannels,
  IPreferenceOverride,
} from '../../entities/subscriber-preference/subscriber-preference.interface';

export interface IGetSubscriberPreferencesResponseDto {
  global: {
    enabled: boolean;
    channels: IPreferenceChannels;
  };
  workflows: Array<{
    enabled: boolean;
    channels: IPreferenceChannels;
    overrides: IPreferenceOverride[];
    workflow: {
      identifier: string;
      name: string;
    };
  }>;
}
