export type OrganizationId = string;

export enum ApiServiceLevelEnum {
  FREE = 'free',
  BUSINESS = 'business',
  ENTERPRISE = 'enterprise',
  // TODO: NV-3067 - Remove unlimited tier once all organizations have a service level
  UNLIMITED = 'unlimited',
}

export enum ProductUseCasesEnum {
  IN_APP = 'in_app',
  MULTI_CHANNEL = 'multi_channel',
  DELAY = 'delay',
  TRANSLATION = 'translation',
  DIGEST = 'digest',
}

export enum JobTitleEnum {
  ENGINEER = 'engineer',
  ENGINEERING_MANAGER = 'engineering_manager',
  ARCHITECT = 'architect',
  PRODUCT_MANAGER = 'product_manager',
  DESIGNER = 'designer',
  FOUNDER = 'cxo_founder',
  MARKETING_MANAGER = 'marketing_manager',
  STUDENT = 'student',
  CXO = 'cxo',
  OTHER = 'other',
}

export enum OrganizationTypeEnum {
  COMPANY = 'Company',
  AGENCY = 'Agency',
  EDUCATIONAL = 'Educational',
  SOLOPRENEUR = 'Solopreneur',
  OTHER = 'Other',
}

export const jobTitleToLabelMapper = {
  [JobTitleEnum.ENGINEER]: 'Engineer',
  [JobTitleEnum.ARCHITECT]: 'Architect',
  [JobTitleEnum.PRODUCT_MANAGER]: 'Product Manager',
  [JobTitleEnum.DESIGNER]: 'Designer',
  [JobTitleEnum.ENGINEERING_MANAGER]: 'Engineering Manager',
  [JobTitleEnum.FOUNDER]: 'Founder',
  [JobTitleEnum.STUDENT]: 'Student',
  [JobTitleEnum.CXO]: 'CXO (CTO/CEO/other...)',
  [JobTitleEnum.MARKETING_MANAGER]: 'Marketing Manager',
  [JobTitleEnum.OTHER]: 'Other',
};
