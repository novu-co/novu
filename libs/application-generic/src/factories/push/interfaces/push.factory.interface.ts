import { type IntegrationEntity } from '@novu/dal';
import { type IPushHandler } from './push.handler.interface';

export interface IPushFactory {
  getHandler(integration: IntegrationEntity): IPushHandler | null;
}
