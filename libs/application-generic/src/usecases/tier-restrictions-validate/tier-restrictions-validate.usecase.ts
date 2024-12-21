import { Injectable } from '@nestjs/common';

import {
  ApiServiceLevelEnum,
  DigestUnitEnum,
  StepTypeEnum,
} from '@novu/shared';
import { CommunityOrganizationRepository } from '@novu/dal';

import { TierRestrictionsValidateCommand } from './tier-restrictions-validate.command';
import {
  ErrorEnum,
  TierRestrictionsValidateResponse,
} from './tier-restrictions-validate.response';
import { InstrumentUsecase } from '../../instrumentation';

export const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;
export const FREE_TIER_MAX_DELAY_DAYS = 30;
export const BUSINESS_TIER_MAX_DELAY_DAYS = 90;
export const MAX_DELAY_FREE_TIER =
  FREE_TIER_MAX_DELAY_DAYS * MILLISECONDS_IN_DAY; // 30 days in milliseconds
export const MAX_DELAY_BUSINESS_TIER =
  BUSINESS_TIER_MAX_DELAY_DAYS * MILLISECONDS_IN_DAY; // 90 days in milliseconds

@Injectable()
export class TierRestrictionsValidateUsecase {
  constructor(
    private organizationRepository: CommunityOrganizationRepository,
  ) {}

  @InstrumentUsecase()
  async execute(
    command: TierRestrictionsValidateCommand,
  ): Promise<TierRestrictionsValidateResponse> {
    const deferDurationMs =
      isValidDigestUnit(command.unit) && isNumber(command.amount)
        ? calculateMilliseconds(command.amount, command.unit)
        : 0;

    const controlValueNeedTierValidation =
      command.stepType === StepTypeEnum.DIGEST ||
      command.stepType === StepTypeEnum.DELAY;

    if (!controlValueNeedTierValidation || !deferDurationMs) {
      return null;
    }

    const issues: TierRestrictionsValidateResponse = [];
    const organization = await this.organizationRepository.findById(
      command.organizationId,
    );
    const tier = organization?.apiServiceLevel;
    const isPaidTier = [
      tier === undefined ||
        tier === ApiServiceLevelEnum.BUSINESS ||
        tier === ApiServiceLevelEnum.ENTERPRISE,
    ];

    if (isPaidTier) {
      if (deferDurationMs > MAX_DELAY_BUSINESS_TIER) {
        issues.push({
          error: ErrorEnum.TIER_LIMIT_EXCEEDED,
          message:
            `The maximum delay allowed is ${BUSINESS_TIER_MAX_DELAY_DAYS} days. ` +
            'Please contact our support team to discuss extending this limit for your use case.',
        });
      }
    }

    if (tier === ApiServiceLevelEnum.FREE) {
      if (deferDurationMs > MAX_DELAY_FREE_TIER) {
        issues.push({
          error: ErrorEnum.TIER_LIMIT_EXCEEDED,
          message:
            `The maximum delay allowed is ${FREE_TIER_MAX_DELAY_DAYS} days. ` +
            'Please upgrade your plan.',
        });
      }
    }

    return issues.length === 0 ? null : issues;
  }
}

function isValidDigestUnit(unit: unknown): unit is DigestUnitEnum {
  return Object.values(DigestUnitEnum).includes(unit as DigestUnitEnum);
}

function isNumber(value: unknown): value is number {
  return !Number.isNaN(Number(value));
}

function calculateMilliseconds(amount: number, unit: DigestUnitEnum): number {
  switch (unit) {
    case DigestUnitEnum.SECONDS:
      return amount * 1000;
    case DigestUnitEnum.MINUTES:
      return amount * 1000 * 60;
    case DigestUnitEnum.HOURS:
      return amount * 1000 * 60 * 60;
    case DigestUnitEnum.DAYS:
      return amount * 1000 * 60 * 60 * 24;
    case DigestUnitEnum.WEEKS:
      return amount * 1000 * 60 * 60 * 24 * 7;
    case DigestUnitEnum.MONTHS:
      return amount * 1000 * 60 * 60 * 24 * 30; // Using 30 days as an approximation for a month
    default:
      return 0;
  }
}
