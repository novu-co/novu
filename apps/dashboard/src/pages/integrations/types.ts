import { ChannelTypeEnum } from '@novu/shared';

export interface ITableIntegration {
  integrationId: string;
  name: string;
  identifier: string;
  provider: string;
  channel: ChannelTypeEnum;
  environment: string;
  active: boolean;
  conditions?: string[];
  primary?: boolean;
  isPrimary?: boolean;
}

export interface IntegrationFormData {
  name: string;
  identifier: string;
  active: boolean;
  primary: boolean;
  credentials: Record<string, any>;
  check: boolean;
  environmentId: string;
}

export type IntegrationStep = 'select' | 'configure';
