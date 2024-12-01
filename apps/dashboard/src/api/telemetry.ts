import { OrganizationTypeEnum, CompanySizeEnum, JobTitleEnum } from '@novu/shared';
import { post } from './api.client';
import * as Sentry from '@sentry/react';

export const sendTelemetry = async (event: string, data?: Record<string, unknown>): Promise<void> => {
  await post('/telemetry/measure', {
    event,
    data,
  });
};

interface IdentifyUserProps {
  hubspotContext: string;
  pageUri: string;
  pageName: string;
  jobTitle: JobTitleEnum;
  organizationType: OrganizationTypeEnum;
  companySize?: CompanySizeEnum;
}

export const identifyUser = async (userData: IdentifyUserProps) => {
  try {
    await post('/telemetry/identify', userData);
  } catch (error) {
    console.error('Error identifying user:', error);
    Sentry.captureException(error);
  }
};
