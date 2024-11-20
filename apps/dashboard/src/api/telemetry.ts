import { post } from './api.client';

export const sendTelemetry = async (event: string, data?: Record<string, unknown>): Promise<void> => {
  await post('/telemetry/measure', {
    event,
    data,
  });
};

export const identifyUser = async (userData: any) => {
  try {
    await post('/v1/telemetry/identify', userData);
  } catch (error) {
    console.error('Error identifying user:', error);
  }
};
