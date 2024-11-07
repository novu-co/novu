import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createHmacSubtle } from './crypto.utils';

const createHmacNode = (secretKey: string, data: string): string => {
  return createHmac('sha256', secretKey).update(data).digest('hex');
};

describe('createHmacSubtle', () => {
  it('should create an HMAC equivalent to node crypto createHmac', async () => {
    const hmacSubtle = await createHmacSubtle('secret', 'data');
    const hmacNode = createHmacNode('secret', 'data');

    expect(hmacSubtle).toEqual(hmacNode);
  });
});
