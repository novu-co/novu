import { getToken } from '@/utils/auth';
import { API_HOSTNAME } from '@/config';
import type { IEnvironment } from '@novu/shared';

export class NovuApiError extends Error {
  constructor(
    message: string,
    public error: unknown,
    public status: number
  ) {
    super(message);
  }
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

const request = async <T>(
  endpoint: string,
  options?: {
    environment?: IEnvironment;
    body?: unknown;
    method?: HttpMethod;
    headers?: HeadersInit;
    version?: 'v1' | 'v2';
    signal?: AbortSignal;
  }
): Promise<T> => {
  const { body, environment, headers, method = 'GET', version = 'v1', signal } = options || {};
  try {
    const jwt = await getToken();
    const config: RequestInit = {
      method,
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
        ...(environment && { 'Novu-Environment-Id': environment._id }),
        ...headers,
      },
      signal,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const baseUrl = API_HOSTNAME ?? 'https://api.novu.co';
    const response = await fetch(`${baseUrl}/${version}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json();
      throw new NovuApiError(`Novu API error`, errorData, response.status);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof NovuApiError) {
      throw error;
    }
    if (typeof error === 'object' && error && 'message' in error) {
      throw new Error(`Fetch error: ${error.message}`);
    }
    throw new Error(`Fetch error: ${JSON.stringify(error)}`);
  }
};

type RequestOptions = { body?: unknown; environment?: IEnvironment; signal?: AbortSignal };

export const get = <T>(endpoint: string, { environment, signal }: RequestOptions = {}) =>
  request<T>(endpoint, { method: 'GET', environment, signal });
export const post = <T>(endpoint: string, options: RequestOptions) =>
  request<T>(endpoint, { method: 'POST', ...options });
export const put = <T>(endpoint: string, options: RequestOptions) =>
  request<T>(endpoint, { method: 'PUT', ...options });
export const del = <T>(endpoint: string, { environment, signal }: RequestOptions = {}) =>
  request<T>(endpoint, { method: 'DELETE', environment, signal });
export const patch = <T>(endpoint: string, options: RequestOptions) =>
  request<T>(endpoint, { method: 'PATCH', ...options });

export const getV2 = <T>(endpoint: string, { environment, signal }: RequestOptions = {}) =>
  request<T>(endpoint, { version: 'v2', method: 'GET', environment, signal });
export const postV2 = <T>(endpoint: string, options: RequestOptions) =>
  request<T>(endpoint, { version: 'v2', method: 'POST', ...options });
export const putV2 = <T>(endpoint: string, options: RequestOptions) =>
  request<T>(endpoint, { version: 'v2', method: 'PUT', ...options });
export const delV2 = <T>(endpoint: string, { environment, signal }: RequestOptions = {}) =>
  request<T>(endpoint, { version: 'v2', method: 'DELETE', environment, signal });
export const patchV2 = <T>(endpoint: string, options: RequestOptions) =>
  request<T>(endpoint, { version: 'v2', method: 'PATCH', ...options });
