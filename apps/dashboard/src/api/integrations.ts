import { IEnvironment, IIntegration, ChannelTypeEnum } from '@novu/shared';
import { del, get, post } from './api.client';

export interface CreateIntegrationData {
  providerId: string;
  channel: ChannelTypeEnum;
  credentials: Record<string, string>;
  name: string;
  identifier: string;
  active: boolean;
  primary?: boolean;
  _environmentId: string;
}

export enum CheckIntegrationResponseEnum {
  INVALID_EMAIL = 'invalid_email',
  BAD_CREDENTIALS = 'bad_credentials',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export async function getIntegrations({ environment }: { environment: IEnvironment }) {
  // TODO: This is a technical debt on the API side.
  // Integrations work across environments, so we should not need to pass the environment ID here.
  const { data } = await get<{ data: IIntegration[] }>('/integrations', { environment });

  return data;
}

export async function deleteIntegration({ id, environment }: { id: string; environment: IEnvironment }) {
  return del<{ acknowledged: boolean; status: number }>(`/integrations/${id}`, {
    environment: environment,
  });
}

export async function createIntegration(data: CreateIntegrationData, environment: IEnvironment) {
  return await post('/integrations', {
    body: data,
    environment: environment,
  });
}
