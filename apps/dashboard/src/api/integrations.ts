import { IIntegration } from '@novu/shared';
import { get } from './api.client';

export async function getIntegrations() {
  const { data } = await get<{ data: IIntegration[] }>('/integrations');

  return data;
}
