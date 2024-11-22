import { type IConstructIntegrationDto } from './construct-integration.interface';

import { type ChannelTypeEnum } from '../../types';

export interface ICreateIntegrationBodyDto extends IConstructIntegrationDto {
  providerId: string;
  channel: ChannelTypeEnum;
}
