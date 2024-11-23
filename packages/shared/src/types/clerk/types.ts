import { ProductUseCases } from '../../dto';
import { ApiServiceLevelEnum, JobTitleEnum } from '../organization';
import { IServicesHashes } from '../../entities/user';

export type OrganizationPublicMetadata = {
  externalOrgId?: string;
  apiServiceLevel?: ApiServiceLevelEnum;
  domain?: string;
  productUseCases?: ProductUseCases;
  language?: string[];
  defaultLocale?: string;
  companySize?: string;
};

export type UserPublicMetadata = {
  profilePicture?: string | null;
  showOnBoarding?: boolean;
  showOnBoardingTour?: number;
  servicesHashes?: IServicesHashes;
  jobTitle?: JobTitleEnum;
};

/**
 * Unsafe metadata can be updated from the frontend directly
 */
export type UserUnsafeMetadata = {
  newDashboardOptInStatus?: NewDashboardOptInStatusEnum;
};

export enum NewDashboardOptInStatusEnum {
  OPTED_IN = 'opted_in', // user switched to the new dashboard
  DISMISSED = 'dismissed', // user dismissed the opt-in widget
  OPTED_OUT = 'opted_out', // user switched back to the old dashboard
  // undefined -> user has not interacted with the widget yet
}
