import { IsBoolean, IsDefined } from 'class-validator';
import { EnvironmentWithSubscriber } from '../../commands';

export class GetSubscriberGlobalPreferenceCommand extends EnvironmentWithSubscriber {
  @IsBoolean()
  @IsDefined()
  includeInactiveChannels: boolean;
}
