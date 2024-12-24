import { UserSession } from '@novu/testing';
import { expect } from 'chai';
import { NotificationTemplateEntity } from '@novu/dal';

import { PreferenceLevelEnum } from '@novu/shared';
import { getPreference, getPreferenceByLevel } from './helpers';

describe('Get Subscribers workflow preferences - /subscribers/:subscriberId/preferences (GET)', function () {
  let session: UserSession;
  let template: NotificationTemplateEntity;

  beforeEach(async () => {
    session = new UserSession();
    await session.initialize();
    template = await session.createTemplate({
      noFeedId: true,
    });
  });

  it('should get subscriber workflow preferences with inactive channels by default', async function () {
    const response = await getPreference(session, session.subscriberId);
    const data = response.data.data[0];

    expect(data.preference.channels).to.deep.equal({
      email: true,
      in_app: true,
      push: true,
      chat: true,
      sms: true,
    });
  });

  it('should get subscriber workflow preferences with inactive channels when includeInactiveChannels is true', async function () {
    const response = await getPreference(session, session.subscriberId, {
      includeInactiveChannels: true,
    });
    const data = response.data.data[0];

    expect(data.preference.channels).to.deep.equal({
      email: true,
      in_app: true,
      push: true,
      chat: true,
      sms: true,
    });
  });

  it('should get subscriber workflow preferences with active channels when includeInactiveChannels is false', async function () {
    const response = await getPreference(session, session.subscriberId, {
      includeInactiveChannels: false,
    });
    const data = response.data.data[0];

    expect(data.preference.channels).to.deep.equal({
      email: true,
      in_app: true,
    });
  });

  it('should handle un existing subscriberId', async function () {
    let error;
    try {
      await getPreference(session, 'unexisting-subscriber-id');
    } catch (e) {
      error = e;
    }

    expect(error).to.be.ok;
    expect(error?.response.data.message).to.contain('not found');
  });
});

describe('Get Subscribers preferences by level - /subscribers/:subscriberId/preferences/:level (GET)', function () {
  let session: UserSession;
  let template: NotificationTemplateEntity;

  beforeEach(async () => {
    session = new UserSession();
    await session.initialize();
    template = await session.createTemplate({
      noFeedId: true,
    });
  });

  const levels = Object.values(PreferenceLevelEnum);

  levels.forEach((level) => {
    it(`should get subscriber ${level} preferences with inactive channels by default`, async function () {
      const response = await getPreferenceByLevel(session, session.subscriberId, level);
      const data = response.data.data[0];

      expect(data.preference.channels).to.deep.equal({
        email: true,
        in_app: true,
        push: true,
        chat: true,
        sms: true,
      });
    });

    it(`should get subscriber ${level} preferences with inactive channels when includeInactiveChannels is true`, async function () {
      const response = await getPreferenceByLevel(session, session.subscriberId, level, {
        includeInactiveChannels: true,
      });
      const data = response.data.data[0];

      expect(data.preference.channels).to.deep.equal({
        email: true,
        in_app: true,
        push: true,
        chat: true,
        sms: true,
      });
    });

    it(`should get subscriber ${level} preferences with active channels when includeInactiveChannels is false`, async function () {
      const response = await getPreferenceByLevel(session, session.subscriberId, level, {
        includeInactiveChannels: false,
      });
      const data = response.data.data[0];

      expect(data.preference.channels).to.deep.equal({
        email: true,
        in_app: true,
      });
    });
  });
});
