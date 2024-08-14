import { ProductUseCases } from '../../dto';
import { ApiServiceLevelEnum } from '../organization';
import { IServicesHashes } from '../../entities/user';
import { JobTitleEnum } from '../organization';

export type _OrganizationPublicMetadata = {
  externalOrgId?: string;
  apiServiceLevel?: ApiServiceLevelEnum;
  domain?: string;
  productUseCases?: ProductUseCases;
  language?: string[];
  defaultLocale?: string;
};

export type _UserPublicMetadata = {
  profilePicture?: string | null;
  showOnBoarding?: boolean;
  showOnBoardingTour?: number;
  servicesHashes?: IServicesHashes;
  jobTitle?: JobTitleEnum;
};
