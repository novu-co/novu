import { beforeEach, describe, expect, Mocked, test, vi } from 'vitest';
import axios from 'axios';
import { IPushOptions } from '@novu/stateless';
import { OneSignalV2PushProvider } from './one-signal-v2.provider';

vi.mock('axios');

const mockNotificationOptions: IPushOptions = {
  title: 'Test',
  content: 'Test push',
  target: ['tester'],
  payload: {
    sound: 'test_sound',
  },
  subscriber: {},
  step: {
    digest: false,
    events: [{}],
    total_count: 1,
  },
};

describe('test onesignal notification api', () => {
  const mockedAxios = axios as Mocked<typeof axios>;

  beforeEach(() => {
    mockedAxios.create.mockReturnThis();
  });

  test('should trigger OneSignal library correctly', async () => {
    const provider = new OneSignalV2PushProvider({
      appId: 'test-app-id',
      apiKey: 'test-key',
    });

    const response = {
      data: {
        id: 'result',
      },
    };

    mockedAxios.request.mockResolvedValue(response);

    const spy = vi.spyOn(provider, 'sendMessage');

    const res = await provider.sendMessage(mockNotificationOptions, {
      iosBadgeCount: 2,
      include_aliases: {
        external_id: ['test'],
      },
    });
    expect(mockedAxios.request).toHaveBeenCalled();
    const data = JSON.parse(
      (mockedAxios.request.mock.calls[0][0].data as string) || '{}',
    );

    expect(data).toEqual({
      include_aliases: {
        external_id: ['tester', 'test'],
      },
      app_id: 'test-app-id',
      target_channel: 'push',
      headings: { en: 'Test' },
      contents: { en: 'Test push' },
      subtitle: {},
      data: { sound: 'test_sound' },
      ios_badge_type: 'Increase',
      ios_badgeCount: 2,
      ios_badge_count: 1,
    });

    expect(spy).toHaveBeenCalledWith(mockNotificationOptions, {
      iosBadgeCount: 2,
      include_aliases: {
        external_id: ['test'],
      },
    });
    expect(res.id).toEqual(response.data.id);
  });

  test('should trigger OneSignal library correctly with _passthrough', async () => {
    const provider = new OneSignalV2PushProvider({
      appId: 'test-app-id',
      apiKey: 'test-key',
    });

    const response = {
      data: {
        id: 'result',
      },
    };

    mockedAxios.request.mockResolvedValue(response);

    const spy = vi.spyOn(provider, 'sendMessage');

    const res = await provider.sendMessage(mockNotificationOptions, {
      iosBadgeCount: 2,
      include_aliases: {
        external_id: ['test'],
      },
      _passthrough: {
        body: {
          include_aliases: {
            external_id: ['test1'],
          },
        },
      },
    });
    expect(mockedAxios.request).toHaveBeenCalled();
    const data = JSON.parse(
      (mockedAxios.request.mock.calls[1][0].data as string) || '{}',
    );

    expect(data).toEqual({
      include_aliases: {
        external_id: ['tester', 'test', 'test1'],
      },
      app_id: 'test-app-id',
      target_channel: 'push',
      headings: { en: 'Test' },
      contents: { en: 'Test push' },
      subtitle: {},
      data: { sound: 'test_sound' },
      ios_badge_type: 'Increase',
      ios_badgeCount: 2,
      ios_badge_count: 1,
    });

    expect(spy).toHaveBeenCalledWith(mockNotificationOptions, {
      iosBadgeCount: 2,
      include_aliases: {
        external_id: ['test'],
      },
      _passthrough: {
        body: {
          include_aliases: {
            external_id: ['test1'],
          },
        },
      },
    });
    expect(res.id).toEqual(response.data.id);
  });
});
