import { Injectable } from '@nestjs/common';
import {
  ContentIssue,
  JSONSchemaDto,
  PreviewPayload,
  StepContentIssueEnum,
  StepTypeEnum,
  UserSessionData,
} from '@novu/shared';
import { merge } from 'lodash';
import { PrepareAndValidateContentCommand } from './prepare-and-validate-content.command';
import { mergeObjects } from '../../../util/jsonUtils';
import { findMissingKeys } from '../../../util/utils';
import { BuildDefaultPayloadUsecase } from '../build-payload-from-placeholder';
import { ValidatedPlaceholderAggregation, ValidatePlaceholderUsecase } from '../validate-placeholders';
import { CollectPlaceholderWithDefaultsUsecase, PlaceholderAggregation } from '../collect-placeholders';
import { ExtractDefaultValuesFromSchemaUsecase } from '../../extract-default-values-from-schema';
import { ValidatedContentResponse } from './validated-content.response';
import { ValidateControlByTierUsecase } from '../validate-control-by-tier/validate-control-by-tier.usecase';

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
    private validateControlByTierUsecase: ValidateControlByTierUsecase
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
      command.user,
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
    user: UserSessionData,
    stepType?: StepTypeEnum
  ): Promise<Record<string, ContentIssue[]>> {
    let finalIssues: Record<string, ContentIssue[]> = {};
    finalIssues = mergeObjects(finalIssues, this.computeIllegalVariablesIssues(valueToPlaceholders));
    finalIssues = mergeObjects(finalIssues, this.getMissingInPayload(providedPayload, valueToPlaceholders, payload));
    finalIssues = mergeObjects(finalIssues, this.computeMissingControlValue(defaultControlValues, userProvidedValues));
    const tierIssues = await this.validateControlByTierUsecase.execute({
      controlValues: defaultControlValues,
      user,
      stepType,
    });
    finalIssues = mergeObjects(finalIssues, tierIssues);

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
}
