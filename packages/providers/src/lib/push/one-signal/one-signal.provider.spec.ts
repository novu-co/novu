import { expect, test, vi, describe, beforeEach, Mocked } from 'vitest';
import axios from 'axios';
import { IPushOptions } from '@novu/stateless';
import { OneSignalPushProvider } from './one-signal.provider';

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
    const provider = new OneSignalPushProvider({
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
      includeExternalUserIds: ['test'],
    });
    expect(mockedAxios.request).toHaveBeenCalled();
    const data = JSON.parse(
      (mockedAxios.request.mock.calls[0][0].data as string) || '{}',
    );

    expect(data).toEqual({
      include_player_ids: ['tester'],
      app_id: 'test-app-id',
      headings: { en: 'Test' },
      contents: { en: 'Test push' },
      subtitle: {},
      data: { sound: 'test_sound' },
      ios_badge_type: 'Increase',
      ios_badgeCount: 2,
      ios_badge_count: 1,
      include_external_user_ids: ['test'],
    });

    expect(spy).toHaveBeenCalledWith(mockNotificationOptions, {
      iosBadgeCount: 2,
      includeExternalUserIds: ['test'],
    });
    expect(res.id).toEqual(response.data.id);
  });

  test('should trigger OneSignal library correctly with _passthrough', async () => {
    const provider = new OneSignalPushProvider({
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
      includeExternalUserIds: ['test'],
      _passthrough: {
        body: {
          include_external_user_ids: ['test1'],
        },
      },
    });
    expect(mockedAxios.request).toHaveBeenCalled();
    const data = JSON.parse(
      (mockedAxios.request.mock.calls[1][0].data as string) || '{}',
    );

    expect(data).toEqual({
      include_player_ids: ['tester'],
      app_id: 'test-app-id',
      headings: { en: 'Test' },
      contents: { en: 'Test push' },
      subtitle: {},
      data: { sound: 'test_sound' },
      ios_badge_type: 'Increase',
      ios_badgeCount: 2,
      ios_badge_count: 1,
      include_external_user_ids: ['test', 'test1'],
    });

    expect(spy).toHaveBeenCalledWith(mockNotificationOptions, {
      iosBadgeCount: 2,
      includeExternalUserIds: ['test'],
      _passthrough: {
        body: {
          include_external_user_ids: ['test1'],
        },
      },
    });
    expect(res.id).toEqual(response.data.id);
  });

  test('should use include_external_user_ids when useExternalUserIds is true', async () => {
    const provider = new OneSignalPushProvider({
      appId: 'test-app-id',
      apiKey: 'test-key',
    });

    const response = {
      data: {
        id: 'result',
      },
    };

    mockedAxios.request.mockResolvedValue(response);

    const notificationWithExternalIds = {
      ...mockNotificationOptions,
      overrides: {
        oneSignalOptions: {
          useExternalUserIds: true
        }
      }
    };

    await provider.sendMessage(notificationWithExternalIds);
    
    expect(mockedAxios.request).toHaveBeenCalled();
    const data = JSON.parse(
      (mockedAxios.request.mock.calls[0][0].data as string) || '{}'
    );

    // Verify that include_external_user_ids is used instead of include_player_ids
    expect(data).toHaveProperty('include_external_user_ids', ['tester']);
    expect(data).not.toHaveProperty('include_player_ids');
  });

  test('should use include_player_ids when useExternalUserIds is false', async () => {
    const provider = new OneSignalPushProvider({
      appId: 'test-app-id',
      apiKey: 'test-key',
    });

    const response = {
      data: {
        id: 'result',
      },
    };

    mockedAxios.request.mockResolvedValue(response);

    const notificationWithPlayerIds = {
      ...mockNotificationOptions,
      overrides: {
        oneSignalOptions: {
          useExternalUserIds: false
        }
      }
    };

    await provider.sendMessage(notificationWithPlayerIds);
    
    expect(mockedAxios.request).toHaveBeenCalled();
    const data = JSON.parse(
      (mockedAxios.request.mock.calls[0][0].data as string) || '{}'
    );

    // Verify that include_player_ids is used
    expect(data).toHaveProperty('include_player_ids', ['tester']);
    expect(data).not.toHaveProperty('include_external_user_ids');
  });

  test('should default to include_player_ids when oneSignalOptions is not provided', async () => {
    const provider = new OneSignalPushProvider({
      appId: 'test-app-id',
      apiKey: 'test-key',
    });

    const response = {
      data: {
        id: 'result',
      },
    };

    mockedAxios.request.mockResolvedValue(response);

    await provider.sendMessage(mockNotificationOptions);
    
    expect(mockedAxios.request).toHaveBeenCalled();
    const data = JSON.parse(
      (mockedAxios.request.mock.calls[0][0].data as string) || '{}'
    );

    // Verify that include_player_ids is used by default
    expect(data).toHaveProperty('include_player_ids', ['tester']);
    expect(data).not.toHaveProperty('include_external_user_ids');
  });
});
