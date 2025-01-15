import { IApiKey, IEnvironment, ITagsResponse } from '@novu/shared';
import { get, getV2, post, put } from './api.client';

export async function getEnvironments() {
  const { data } = await get<{ data: IEnvironment[] }>('/environments');
  return data;
}

export async function updateEnvironment({ environment, name }: { environment: IEnvironment; name: string }) {
  return put<{ data: IEnvironment }>(`/environments/${environment._id}`, { body: { name } });
}

export async function updateBridgeUrl({ environment, url }: { environment: IEnvironment; url?: string }) {
  return put(`/environments/${environment._id}`, { body: { bridge: { url } } });
}

export async function getApiKeys({ environment }: { environment: IEnvironment }): Promise<{ data: IApiKey[] }> {
  // TODO: This is a technical debt on the API side.
  // This endpoints should be /environments/:environmentId/api-keys
  return get<{ data: IApiKey[] }>(`/environments/api-keys`, { environment });
}

export async function getTags({ environment }: { environment: IEnvironment }): Promise<ITagsResponse> {
  const { data } = await getV2<{ data: ITagsResponse }>(`/environments/${environment._id}/tags`);
  return data;
}

export async function createEnvironment(payload: { name: string }): Promise<IEnvironment> {
  const response = await post<{ data: IEnvironment }>('/environments', { body: payload });

  return response.data;
}
