import { Injectable } from '@nestjs/common';
import { OrganizationEntity, OrganizationRepository } from '@novu/dal';
import { ApiServiceLevelEnum, ContentIssue, DigestUnitEnum, StepContentIssueEnum, StepTypeEnum } from '@novu/shared';
import { ValidateControlByTierCommand } from './validate-control-by-tier.command';

const MAX_DELAY_DAYS_FREE_TIER = 30;
const MAX_DELAY_DAYS_BUSINESS_TIER = 90;

type controlKey = string;
type ValidateControlByTierUsecaseResponse = Record<controlKey, ContentIssue[]> | {};

@Injectable()
export class ValidateControlByTierUsecase {
  constructor(private readonly organizationRepository: OrganizationRepository) {}

  async execute(command: ValidateControlByTierCommand): Promise<ValidateControlByTierUsecaseResponse> {
    return this.validateControlValuesByTierLimits(command.controlValues, command.user.organizationId, command.stepType);
  }

  private async validateControlValuesByTierLimits(
    defaultControlValues: Record<string, unknown>,
    organizationId: string,
    stepType?: StepTypeEnum
  ): Promise<ValidateControlByTierUsecaseResponse> {
    const controlValueNeedTierValidation =
      stepType === StepTypeEnum.DIGEST || stepType === StepTypeEnum.DELAY || stepType === StepTypeEnum.IN_APP;

    if (!controlValueNeedTierValidation) {
      return {};
    }

    const issues: Record<string, ContentIssue[]> = {};
    let organization: OrganizationEntity | null = null;
    const controlValues = defaultControlValues;
    if (
      controlValues.unit &&
      controlValues.amount &&
      this.isNumber(controlValues.amount) &&
      this.isValidDigestUnit(controlValues.unit)
    ) {
      organization = await this.getOrganization(organization, organizationId);

      const delayInDays = this.calculateDaysFromUnit(controlValues.amount, controlValues.unit);

      const tier = organization?.apiServiceLevel;
      if (tier === undefined || tier === ApiServiceLevelEnum.BUSINESS || tier === ApiServiceLevelEnum.ENTERPRISE) {
        if (delayInDays > MAX_DELAY_DAYS_BUSINESS_TIER) {
          issues.tier = [
            ...(issues.tier || []),
            {
              issueType: StepContentIssueEnum.TIER_LIMIT_EXCEEDED,
              message:
                `The maximum delay allowed is ${MAX_DELAY_DAYS_BUSINESS_TIER} days.` +
                'Please contact our support team to discuss extending this limit for your use case.',
            },
          ];
        }
      }

      if (tier === ApiServiceLevelEnum.FREE) {
        if (delayInDays > MAX_DELAY_DAYS_FREE_TIER) {
          issues.tier = [
            ...(issues.tier || []),
            {
              issueType: StepContentIssueEnum.TIER_LIMIT_EXCEEDED,
              message:
                `The maximum delay allowed is ${MAX_DELAY_DAYS_FREE_TIER} days.` +
                'Please contact our support team to discuss extending this limit for your use case.',
            },
          ];
        }
      }
    }

    return issues;
  }
  private isValidDigestUnit(unit: unknown): unit is DigestUnitEnum {
    return Object.values(DigestUnitEnum).includes(unit as DigestUnitEnum);
  }

  private isNumber(value: unknown): value is number {
    return !Number.isNaN(Number(value));
  }

  private calculateDaysFromUnit(amount: number, unit: DigestUnitEnum): number {
    switch (unit) {
      case DigestUnitEnum.SECONDS:
        return amount / (24 * 60 * 60);
      case DigestUnitEnum.MINUTES:
        return amount / (24 * 60);
      case DigestUnitEnum.HOURS:
        return amount / 24;
      case DigestUnitEnum.DAYS:
        return amount;
      case DigestUnitEnum.WEEKS:
        return amount * 7;
      case DigestUnitEnum.MONTHS:
        return amount * 30; // Using 30 days as an approximation for a month
      default:
        return 0;
    }
  }

  private async getOrganization(
    organization: OrganizationEntity | null,
    organizationId: string
  ): Promise<OrganizationEntity | null> {
    if (organization === null) {
      return await this.organizationRepository.findById(organizationId);
    }

    return organization;
  }
}
