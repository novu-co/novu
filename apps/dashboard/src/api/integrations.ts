import { get } from './api.client';

export async function getIntegrations() {
  const { data } = await get<{ data: any[] }>('/integrations');

  return data;
}
