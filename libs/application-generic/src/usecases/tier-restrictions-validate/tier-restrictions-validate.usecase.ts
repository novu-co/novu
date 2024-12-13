import { Injectable } from '@nestjs/common';

import { ApiServiceLevelEnum, StepTypeEnum } from '@novu/shared';
import { CommunityOrganizationRepository } from '@novu/dal';

import { TierRestrictionsValidateCommand } from './tier-restrictions-validate.command';
import {
  ErrorEnum,
  TierRestrictionsValidateResponse,
} from './tier-restrictions-validate.response';
import {
  FREE_TIER_MAX_DELAY_DAYS,
  BUSINESS_TIER_MAX_DELAY_DAYS,
  MAX_DELAY_FREE_TIER,
  MAX_DELAY_BUSINESS_TIER,
} from './tier-restrictions-validate.consts';
import { InstrumentUsecase } from '../../instrumentation';

@Injectable()
export class TierRestrictionsValidateUsecase {
  constructor(
    private organizationRepository: CommunityOrganizationRepository,
  ) {}

  @InstrumentUsecase()
  async execute(
    command: TierRestrictionsValidateCommand,
  ): Promise<TierRestrictionsValidateResponse> {
    return this.validateControlValuesByTierLimits(
      command.organizationId,
      command.deferDurationMs,
      command.stepType,
    );
  }

  private async validateControlValuesByTierLimits(
    organizationId: string,
    deferDurationMs?: number,
    stepType?: StepTypeEnum,
  ): Promise<TierRestrictionsValidateResponse> {
    const controlValueNeedTierValidation =
      stepType === StepTypeEnum.DIGEST || stepType === StepTypeEnum.DELAY;

    if (!controlValueNeedTierValidation || !deferDurationMs) {
      return null;
    }

    const issues: TierRestrictionsValidateResponse = [];
    const organization =
      await this.organizationRepository.findById(organizationId);
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
