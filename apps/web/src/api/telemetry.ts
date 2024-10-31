import { api } from './api.client';

export const identifyUser = async (userData) => {
  try {
    await api.post('/v1/telemetry/identify', userData);
  } catch (error) {
    console.error('Error identifying user:', error);
  }
};
