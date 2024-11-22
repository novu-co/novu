import { type IPreferenceChannels } from '../../entities/subscriber-preference';

export interface IWorkflowOverrideRequestDto {
  active?: boolean;

  preferenceSettings?: IPreferenceChannels;
}
