import { api } from './api.client';

export async function createThread({ threadText }) {
  return await api.post('/v1/support/create-thread', {
    text: threadText,
  });
}
