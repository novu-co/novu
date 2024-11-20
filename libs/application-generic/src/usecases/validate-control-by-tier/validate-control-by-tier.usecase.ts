import { Injectable } from '@nestjs/common';
import { OrganizationEntity, OrganizationRepository } from '@novu/dal';
import {
  ApiServiceLevelEnum,
  ContentIssue,
  StepContentIssueEnum,
  StepTypeEnum,
} from '@novu/shared';
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
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(
    command: ValidateControlByTierCommand,
  ): Promise<ValidateControlByTierUsecaseResponse> {
    return this.validateControlValuesByTierLimits(
      command.deferDuration,
      command.organizationId,
      command.stepType,
    );
  }

  private async validateControlValuesByTierLimits(
    deferDuration: Milliseconds,
    organizationId: string,
    stepType?: StepTypeEnum,
  ): Promise<ValidateControlByTierUsecaseResponse> {
    const controlValueNeedTierValidation =
      stepType === StepTypeEnum.DIGEST || stepType === StepTypeEnum.DELAY;

    if (!controlValueNeedTierValidation) {
      return {};
    }

    const issues: Record<string, ContentIssue[]> = {};
    let organization: OrganizationEntity | null = null;
    if (deferDuration) {
      organization = await this.getOrganization(organization, organizationId);

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
    }

    return issues;
  }

  private async getOrganization(
    organization: OrganizationEntity | null,
    organizationId: string,
  ): Promise<OrganizationEntity | null> {
    if (organization === null) {
      return await this.organizationRepository.findById(organizationId);
    }

    return organization;
  }
}
