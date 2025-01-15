export type EnvironmentId = string;

export enum SystemEnvironmentsEnum {
  DEVELOPMENT = 'Development',
  PRODUCTION = 'Production',
}

export const PROTECTED_ENVIRONMENTS = [SystemEnvironmentsEnum.DEVELOPMENT, SystemEnvironmentsEnum.PRODUCTION] as const;

export type EnvironmentName = SystemEnvironmentsEnum | string;
