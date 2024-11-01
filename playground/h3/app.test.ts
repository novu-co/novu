import { describe, expect, it } from 'vitest';
import { listen } from 'listhen';
import { app } from './app';

describe('h3 framework handler', () => {
  it('should return a successful health-check response', async () => {
    /** TODO: fix this */
    // @ts-expect-error - type 'EventHandler<EventHandlerRequest, any>' is not assignable to parameter of type 'RequestListener'
    const listener = await listen(app.handler);

    const response = await fetch('http://localhost:4000/api/novu');
    expect(response.status).toEqual(200);

    const data = await response.json();
    const { headers } = response;
    expect(data.status).toEqual('ok');
    expect(headers.get('novu-framework-server')).toEqual('h3');

    listener.close();
  });
});
