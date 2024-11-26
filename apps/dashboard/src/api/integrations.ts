import type { IntegrationResponse } from '@novu/shared';
import { get } from './api.client';

export async function getIntegrations() {
  const { data } = await get<{ data: IntegrationResponse[] }>('/integrations');

  return data;
}
