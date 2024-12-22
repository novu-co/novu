import { Injectable } from '@nestjs/common';
import { parseExpression as parseCronExpression } from 'cron-parser';

import {
  ApiServiceLevelEnum,
  DigestUnitEnum,
  StepTypeEnum,
} from '@novu/shared';
import { CommunityOrganizationRepository } from '@novu/dal';

import { differenceInMilliseconds } from 'date-fns';

import { TierRestrictionsValidateCommand } from './tier-restrictions-validate.command';
import {
  ErrorEnum,
  TierRestrictionsValidateResponse,
  TierValidationError,
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
    if (![StepTypeEnum.DIGEST, StepTypeEnum.DELAY].includes(command.stepType)) {
      return [];
    }

    const apiServiceLevel = (
      await this.organizationRepository.findById(command.organizationId)
    )?.apiServiceLevel;

    if (isCronExpression(command.cron)) {
      // TODO: Implement cron expression validation

      /*
       * const deferDurationMs = this.buildCronDeltaDeferDuration(command);
       * const issue = buildIssue(
       *   deferDurationMs,
       *   getMaxDelay(apiServiceLevel),
       *   ErrorEnum.TIER_LIMIT_EXCEEDED,
       *   'cron',
       * );
       */

      return [];
    }

    if (isRegularDeferAction(command)) {
      const deferDurationMs = calculateDeferDuration(command);

      const amountIssue = buildIssue(
        deferDurationMs,
        getMaxDelay(apiServiceLevel),
        ErrorEnum.TIER_LIMIT_EXCEEDED,
        'amount',
      );
      const unitIssue = buildIssue(
        deferDurationMs,
        getMaxDelay(apiServiceLevel),
        ErrorEnum.TIER_LIMIT_EXCEEDED,
        'unit',
      );

      return [amountIssue, unitIssue].filter(Boolean);
    }

    return [];
  }

  private buildCronDeltaDeferDuration(
    command: TierRestrictionsValidateCommand,
  ): number | null {
    const cronExpression = parseCronExpression(command.cron);
    const firstTime = cronExpression.next().toDate();
    const secondTime = cronExpression.next().toDate();

    return differenceInMilliseconds(firstTime, secondTime);
  }
}

function calculateDeferDuration(
  command: TierRestrictionsValidateCommand,
): number | null {
  if (command.deferDurationMs) {
    return command.deferDurationMs;
  }

  if (isValidDigestUnit(command.unit) && isNumber(command.amount)) {
    return calculateMilliseconds(command.amount, command.unit);
  }

  return null;
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

/*
 * Cron expression is another term for a timed digest
 */
const isCronExpression = (cron: string) => {
  return !!cron;
};

const isRegularDeferAction = (command: TierRestrictionsValidateCommand) => {
  return (
    !!command.amount &&
    isNumber(command.amount) &&
    !!command.unit &&
    isValidDigestUnit(command.unit)
  );
};

function getMaxDelay(tier: ApiServiceLevelEnum): number {
  if (
    tier === ApiServiceLevelEnum.BUSINESS ||
    tier === ApiServiceLevelEnum.ENTERPRISE
  ) {
    return MAX_DELAY_BUSINESS_TIER;
  }

  return MAX_DELAY_FREE_TIER;
}

function buildIssue(
  deferDurationMs: number,
  maxDelayMs: number,
  error: ErrorEnum,
  controlKey: string,
): TierValidationError | null {
  if (deferDurationMs > maxDelayMs) {
    return {
      controlKey,
      error,
      message:
        `The maximum delay allowed is ${msToDays(maxDelayMs)} days. ` +
        'Please contact our support team to discuss extending this limit for your use case.',
    };
  }

  return null;
}

function msToDays(ms: number): number {
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}
