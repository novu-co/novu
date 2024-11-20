import { Injectable } from '@nestjs/common';

import {
  ApiServiceLevelEnum,
  ContentIssue,
  StepContentIssueEnum,
  StepTypeEnum,
} from '@novu/shared';
import { CommunityOrganizationRepository } from '@novu/dal';

import {
  Milliseconds,
  ValidateControlByTierCommand,
} from './validate-control-by-tier.command';

const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;
const FREE_TIER_MAX_DELAY_DAYS = 30;
const BUSINESS_TIER_MAX_DELAY_DAYS = 90;
const MAX_DELAY_FREE_TIER = FREE_TIER_MAX_DELAY_DAYS * MILLISECONDS_IN_DAY; // 30 days in milliseconds
const MAX_DELAY_BUSINESS_TIER =
  BUSINESS_TIER_MAX_DELAY_DAYS * MILLISECONDS_IN_DAY; // 90 days in milliseconds

type controlKey = string;
type ValidateControlByTierUsecaseResponse =
  | Record<controlKey, ContentIssue[]>
  | {};

@Injectable()
export class ValidateControlByTierUsecase {
  constructor(
    private organizationRepository: CommunityOrganizationRepository,
  ) {}

  async execute(
    command: ValidateControlByTierCommand,
  ): Promise<ValidateControlByTierUsecaseResponse> {
    return this.validateControlValuesByTierLimits(
      command.organizationId,
      command.deferDuration,
      command.stepType,
    );
  }

  private async validateControlValuesByTierLimits(
    organizationId: string,
    deferDuration?: Milliseconds,
    stepType?: StepTypeEnum,
  ): Promise<ValidateControlByTierUsecaseResponse> {
    const controlValueNeedTierValidation =
      stepType === StepTypeEnum.DIGEST || stepType === StepTypeEnum.DELAY;

    if (!controlValueNeedTierValidation || !deferDuration) {
      return {};
    }

    const issues: Record<string, ContentIssue[]> = {};
    const organization =
      await this.organizationRepository.findById(organizationId);
    const tier = organization?.apiServiceLevel;

    if (
      tier === undefined ||
      tier === ApiServiceLevelEnum.BUSINESS ||
      tier === ApiServiceLevelEnum.ENTERPRISE
    ) {
      if (deferDuration > MAX_DELAY_BUSINESS_TIER) {
        issues.tier = [
          ...(issues.tier || []),
          {
            issueType: StepContentIssueEnum.TIER_LIMIT_EXCEEDED,
            message:
              `The maximum delay allowed is ${BUSINESS_TIER_MAX_DELAY_DAYS} days.` +
              'Please contact our support team to discuss extending this limit for your use case.',
          },
        ];
      }
    }

    if (tier === ApiServiceLevelEnum.FREE) {
      if (deferDuration > MAX_DELAY_FREE_TIER) {
        issues.tier = [
          ...(issues.tier || []),
          {
            issueType: StepContentIssueEnum.TIER_LIMIT_EXCEEDED,
            message:
              `The maximum delay allowed is ${FREE_TIER_MAX_DELAY_DAYS} days.` +
              'Please contact our support team to discuss extending this limit for your use case.',
          },
        ];
      }
    }

    return issues;
  }
}
