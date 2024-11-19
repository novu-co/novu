import { Injectable } from '@nestjs/common';
import {
  ApiServiceLevelEnum,
  ContentIssue,
  DigestUnitEnum,
  JSONSchemaDto,
  PreviewPayload,
  StepContentIssueEnum,
  StepTypeEnum,
} from '@novu/shared';
import { merge } from 'lodash';
import { OrganizationEntity, OrganizationRepository } from '@novu/dal';
import { PrepareAndValidateContentCommand } from './prepare-and-validate-content.command';
import { mergeObjects } from '../../../util/jsonUtils';
import { findMissingKeys } from '../../../util/utils';
import { BuildDefaultPayloadUsecase } from '../build-payload-from-placeholder';
import { ValidatedPlaceholderAggregation, ValidatePlaceholderUsecase } from '../validate-placeholders';
import { CollectPlaceholderWithDefaultsUsecase, PlaceholderAggregation } from '../collect-placeholders';
import { ExtractDefaultValuesFromSchemaUsecase } from '../../extract-default-values-from-schema';
import { ValidatedContentResponse } from './validated-content.response';

const MAX_DELAY_DAYS_FREE_TIER = 30;
const MAX_DELAY_DAYS_BUSINESS_TIER = 90;

/**
 * Validates and prepares workflow step content by collecting placeholders,
 * validating against schemas, merging payloads and control values, and
 * identifying any validation issues.
 *
 * @returns {ValidatedContentResponse} Contains final payload, control values and validation issues
 */
@Injectable()
export class PrepareAndValidateContentUsecase {
  constructor(
    private constructPayloadUseCase: BuildDefaultPayloadUsecase,
    private validatePlaceholdersUseCase: ValidatePlaceholderUsecase,
    private collectPlaceholderWithDefaultsUsecase: CollectPlaceholderWithDefaultsUsecase,
    private extractDefaultsFromSchemaUseCase: ExtractDefaultValuesFromSchemaUsecase,
    private organizationRepository: OrganizationRepository
  ) {}

  async execute(command: PrepareAndValidateContentCommand): Promise<ValidatedContentResponse> {
    const controlValueToPlaceholders = this.collectPlaceholders(command.controlValues);
    const controlValueToValidPlaceholders = this.validatePlaceholders(
      controlValueToPlaceholders,
      command.variableSchema
    );
    const finalPayload = this.buildAndMergePayload(controlValueToValidPlaceholders, command.previewPayloadFromDto);
    const { defaultControlValues, finalControlValues } = this.mergeAndSanitizeControlValues(
      command.controlDataSchema,
      command.controlValues,
      controlValueToValidPlaceholders
    );

    const issues = await this.buildIssues(
      finalPayload,
      command.previewPayloadFromDto || finalPayload, // if no payload provided no point creating issues.
      defaultControlValues,
      command.controlValues,
      controlValueToValidPlaceholders,
      command.organizationId,
      command.stepType
    );

    return {
      finalPayload,
      finalControlValues,
      issues,
    };
  }

  private collectPlaceholders(controlValues: Record<string, unknown>) {
    return this.collectPlaceholderWithDefaultsUsecase.execute({
      controlValues,
    });
  }

  private validatePlaceholders(
    controlValueToPlaceholders: Record<string, PlaceholderAggregation>,
    variableSchema: JSONSchemaDto // Now using JsonStepSchemaDto
  ) {
    return this.validatePlaceholdersUseCase.execute({
      controlValueToPlaceholders,
      variableSchema,
    });
  }

  private buildAndMergePayload(
    controlValueToValidPlaceholders: Record<string, ValidatedPlaceholderAggregation>,
    previewPayloadFromDto?: PreviewPayload
  ) {
    const { previewPayload } = this.constructPayloadUseCase.execute({
      placeholderAggregators: Object.values(controlValueToValidPlaceholders),
    });

    return previewPayloadFromDto ? merge(previewPayload, previewPayloadFromDto) : previewPayload;
  }

  private mergeAndSanitizeControlValues(
    jsonSchema: JSONSchemaDto, // Now using JsonSchemaDto
    controlValues: Record<string, unknown>,
    controlValueToValidPlaceholders: Record<string, ValidatedPlaceholderAggregation>
  ) {
    const defaultControlValues = this.extractDefaultsFromSchemaUseCase.execute({
      jsonSchemaDto: jsonSchema,
    });
    const mergedControlValues = merge(defaultControlValues, controlValues);
    Object.keys(mergedControlValues).forEach((controlValueKey) => {
      const controlValue = mergedControlValues[controlValueKey];

      if (typeof controlValue !== 'string') {
        return;
      }

      const placeholders = controlValueToValidPlaceholders[controlValueKey];
      if (!placeholders) {
        return;
      }

      let cleanedControlValue = controlValue; // Initialize cleanedControlValue with the original controlValue

      for (const problematicPlaceholder of Object.keys(placeholders.problematicPlaceholders)) {
        cleanedControlValue = this.removePlaceholdersFromText(problematicPlaceholder, cleanedControlValue);
      }

      mergedControlValues[controlValueKey] = cleanedControlValue; // Update mergedControlValues with cleanedControlValue
    });

    return { defaultControlValues, finalControlValues: mergedControlValues };
  }

  private removePlaceholdersFromText(text: string, targetText: string) {
    const regex = /\{\{\s*([^}]*?)\s*\}\}/g;
    let match: RegExpExecArray | null;

    // eslint-disable-next-line no-cond-assign
    while ((match = regex.exec(text)) !== null) {
      const placeholderContent = match[1].trim();
      const placeholderRegex = new RegExp(`\\s*\\{\\{\\s*${placeholderContent}\\s*\\}\\}\\s*`, 'g');
      // eslint-disable-next-line no-param-reassign
      targetText = targetText.replace(placeholderRegex, '');
    }

    return targetText.trim();
  }

  private async buildIssues(
    payload: PreviewPayload,
    providedPayload: PreviewPayload,
    defaultControlValues: Record<string, unknown>,
    userProvidedValues: Record<string, unknown>,
    valueToPlaceholders: Record<string, ValidatedPlaceholderAggregation>,
    organizationId: string,
    stepType?: StepTypeEnum
  ): Promise<Record<string, ContentIssue[]>> {
    let finalIssues: Record<string, ContentIssue[]> = {};
    finalIssues = mergeObjects(finalIssues, this.computeIllegalVariablesIssues(valueToPlaceholders));
    finalIssues = mergeObjects(finalIssues, this.getMissingInPayload(providedPayload, valueToPlaceholders, payload));
    finalIssues = mergeObjects(finalIssues, this.computeMissingControlValue(defaultControlValues, userProvidedValues));
    finalIssues = mergeObjects(
      finalIssues,
      await this.computeTierLimitExceeded(defaultControlValues, organizationId, stepType)
    );

    return finalIssues;
  }

  private computeIllegalVariablesIssues(
    controlValueToValidPlaceholders: Record<string, ValidatedPlaceholderAggregation>
  ) {
    const result: Record<string, ContentIssue[]> = {};

    for (const [controlValue, placeholderAggregation] of Object.entries(controlValueToValidPlaceholders)) {
      const illegalVariables = placeholderAggregation.problematicPlaceholders;
      for (const [placeholder, errorMsg] of Object.entries(illegalVariables)) {
        if (!result[controlValue]) {
          result[controlValue] = [];
        }
        result[controlValue].push({
          issueType: StepContentIssueEnum.ILLEGAL_VARIABLE_IN_CONTROL_VALUE,
          variableName: placeholder,
          message: errorMsg,
        });
      }
    }

    return result;
  }

  private getMissingInPayload(
    userProvidedPayload: PreviewPayload,
    controlValueToValidPlaceholders: Record<string, ValidatedPlaceholderAggregation>,
    defaultPayload: PreviewPayload
  ) {
    const missingPayloadKeys = findMissingKeys(defaultPayload, userProvidedPayload);
    const result: Record<string, ContentIssue[]> = {};

    for (const item of missingPayloadKeys) {
      const controlValueKeys = Object.keys(controlValueToValidPlaceholders);
      for (const controlValueKey of controlValueKeys) {
        const placeholder = controlValueToValidPlaceholders[controlValueKey].validRegularPlaceholdersToDefaultValue;
        if (placeholder[`{{${item}}}`]) {
          if (!result[controlValueKey]) {
            result[controlValueKey] = [];
          }
          result[controlValueKey].push({
            issueType: StepContentIssueEnum.MISSING_VARIABLE_IN_PAYLOAD,
            variableName: item,
            message: `[${item}] Missing Reference in payload`,
          });
        }
      }
    }

    return result;
  }

  private computeMissingControlValue(
    defaultControlValues: Record<string, unknown>,
    userProvidedValues: Record<string, unknown>
  ) {
    const missingControlKeys = findMissingKeys(defaultControlValues, userProvidedValues);
    const result: Record<string, ContentIssue[]> = {};

    for (const item of missingControlKeys) {
      result[item] = [
        {
          issueType: StepContentIssueEnum.MISSING_VALUE,
          message: `[${item}] No Value was submitted to a required control.`,
        },
      ];
    }

    return result;
  }

  private async computeTierLimitExceeded(
    defaultControlValues: Record<string, unknown>,
    organizationId: string,
    stepType?: StepTypeEnum
  ) {
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
