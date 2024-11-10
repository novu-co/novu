/**
 * Create HMAC using subtle crypto.
 *
 * `crypto.subtle` is a Web Crypto API this is available in browsers,
 * Node.js, and most edge runtimes, such as Cloudflare Workers.
 *
 * @param secretKey - The secret key.
 * @param data - The data to hash.
 * @returns The HMAC.
 */
export const createHmacSubtle = async (secretKey: string, data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const dataBuffer = encoder.encode(data);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    {
      name: 'HMAC',
      hash: { name: 'SHA-256' },
    },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer);

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};
