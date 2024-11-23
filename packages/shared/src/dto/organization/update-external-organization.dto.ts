import { JobTitleEnum } from '../../types';

export type UpdateExternalOrganizationDto = {
  jobTitle?: JobTitleEnum;
  domain?: string;
  language?: string[];
  frontendStack?: string[];
  companySize?: string;
};
