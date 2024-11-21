export enum ErrorEnum {
  TIER_LIMIT_EXCEEDED = 'TIER_LIMIT_EXCEEDED',
}

type TierValidationError = {
  error: ErrorEnum;
  message: string;
};

export type TierRestrictionsValidateResponse = TierValidationError[] | null;
