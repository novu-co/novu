import { expect } from 'chai';
import { NestFactory } from '@nestjs/core';
import {
  SubscriberPreferenceRepository,
  NotificationTemplateRepository,
  PreferenceLevelEnum,
  PreferencesRepository,
} from '@novu/dal';
import { UpsertPreferences } from '@novu/application-generic';
import { DEFAULT_WORKFLOW_PREFERENCES, PreferencesTypeEnum } from '@novu/shared';
import { UserSession } from '@novu/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { preferenceCentralization } from './preference-centralization-migration';

describe('Preference Centralization Migration', function () {
  let app: INestApplication;
  let session: UserSession;
  let subscriberPreferenceRepository: SubscriberPreferenceRepository;
  let notificationTemplateRepository: NotificationTemplateRepository;
  let preferenceRepository: PreferencesRepository;
  let upsertPreferences: UpsertPreferences;

  before(async () => {
    app = await NestFactory.create(AppModule, { logger: false });
    subscriberPreferenceRepository = app.get(SubscriberPreferenceRepository);
    notificationTemplateRepository = app.get(NotificationTemplateRepository);
    preferenceRepository = app.get(PreferencesRepository);
    upsertPreferences = app.get(UpsertPreferences);
  });

  beforeEach(async () => {
    session = new UserSession();
    await session.initialize();

    // Clean up the repositories before each test
    await subscriberPreferenceRepository._model.deleteMany({});
    await notificationTemplateRepository._model.deleteMany({});
    await preferenceRepository._model.deleteMany({});
  });

  after(async () => {
    await app.close();
  });

  it('should migrate subscriber global preferences', async function () {
    await subscriberPreferenceRepository.create({
      _subscriberId: session.subscriberId,
      _environmentId: session.environment._id,
      _organizationId: session.organization._id,
      level: PreferenceLevelEnum.GLOBAL,
      channels: { email: true, sms: true },
    });

    await preferenceCentralization();

    const updatedPreferences = await preferenceRepository.find({
      _environmentId: session.environment._id,
      _organizationId: session.organization._id,
    });
    expect(updatedPreferences.length).to.equal(1);
    expect(updatedPreferences[0].type).to.equal(PreferencesTypeEnum.SUBSCRIBER_GLOBAL);
    expect(updatedPreferences[0].preferences).to.deep.equal({
      all: { enabled: true, readOnly: false },
      channels: {
        push: {},
        chat: {},
        in_app: {},
        email: { enabled: true },
        sms: { enabled: true },
      },
    });
  });

  it('should migrate subscriber workflow preferences', async function () {
    await subscriberPreferenceRepository.create({
      _subscriberId: session.subscriberId,
      _templateId: NotificationTemplateRepository.createObjectId(),
      _environmentId: session.environment._id,
      _organizationId: session.organization._id,
      level: PreferenceLevelEnum.TEMPLATE,
      channels: { push: true },
    });

    await preferenceCentralization();

    const updatedPreferences = await preferenceRepository.find({
      _environmentId: session.environment._id,
      _organizationId: session.organization._id,
    });
    expect(updatedPreferences.length).to.equal(1);
    expect(updatedPreferences[0].type).to.equal(PreferencesTypeEnum.SUBSCRIBER_WORKFLOW);
    expect(updatedPreferences[0].preferences).to.deep.equal({
      all: { enabled: true, readOnly: false },
      channels: {
        push: { enabled: true },
        chat: {},
        email: {},
        in_app: {},
        sms: {},
      },
    });
  });

  it('should migrate workflows with preference settings and critical flag true', async function () {
    await notificationTemplateRepository.create({
      _creatorId: session.user._id,
      _environmentId: session.environment._id,
      _organizationId: session.organization._id,
      critical: true,
      preferenceSettings: { email: true, sms: false, push: true, in_app: true, chat: true },
    });

    await preferenceCentralization();

    const updatedPreferences = await preferenceRepository.find({
      _environmentId: session.environment._id,
      _organizationId: session.organization._id,
    });
    expect(updatedPreferences.length).to.equal(2);
    const workflowPreference = updatedPreferences.find(
      (preference) => preference.type === PreferencesTypeEnum.WORKFLOW_RESOURCE
    );
    const userPreference = updatedPreferences.find(
      (preference) => preference.type === PreferencesTypeEnum.USER_WORKFLOW
    );

    expect(workflowPreference?.preferences).to.deep.equal(DEFAULT_WORKFLOW_PREFERENCES);
    expect(userPreference?.preferences).to.deep.equal({
      all: { enabled: true, readOnly: true },
      channels: {
        push: { enabled: true },
        chat: { enabled: true },
        email: { enabled: true },
        in_app: { enabled: true },
        sms: { enabled: false },
      },
    });
  });

  it('should migrate workflows with preference settings and critical flag false', async function () {
    await notificationTemplateRepository.create({
      _creatorId: session.user._id,
      _environmentId: session.environment._id,
      _organizationId: session.organization._id,
      critical: false,
      preferenceSettings: { email: true, sms: false, push: true, in_app: true, chat: true },
    });

    await preferenceCentralization();

    const updatedPreferences = await preferenceRepository.find({
      _environmentId: session.environment._id,
      _organizationId: session.organization._id,
    });
    expect(updatedPreferences.length).to.equal(2);
    const workflowPreference = updatedPreferences.find(
      (preference) => preference.type === PreferencesTypeEnum.WORKFLOW_RESOURCE
    );
    const userPreference = updatedPreferences.find(
      (preference) => preference.type === PreferencesTypeEnum.USER_WORKFLOW
    );

    expect(workflowPreference?.preferences).to.deep.equal(DEFAULT_WORKFLOW_PREFERENCES);
    expect(userPreference?.preferences).to.deep.equal({
      all: { enabled: true, readOnly: false },
      channels: {
        push: { enabled: true },
        chat: { enabled: true },
        email: { enabled: true },
        in_app: { enabled: true },
        sms: { enabled: false },
      },
    });
  });

  it('should migrate workflows without preference settings', async function () {
    await notificationTemplateRepository.create({
      _creatorId: session.user._id,
      _environmentId: session.environment._id,
      _organizationId: session.organization._id,
    });

    await preferenceCentralization();

    const updatedPreferences = await preferenceRepository.find({
      _environmentId: session.environment._id,
      _organizationId: session.organization._id,
    });
    expect(updatedPreferences.length).to.equal(2);
    const workflowPreference = updatedPreferences.find(
      (preference) => preference.type === PreferencesTypeEnum.WORKFLOW_RESOURCE
    );
    const userPreference = updatedPreferences.find(
      (preference) => preference.type === PreferencesTypeEnum.USER_WORKFLOW
    );

    expect(workflowPreference?.preferences).to.deep.equal(DEFAULT_WORKFLOW_PREFERENCES);
    expect(userPreference?.preferences).to.deep.equal(DEFAULT_WORKFLOW_PREFERENCES);
  });
});
