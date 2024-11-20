import { Injectable } from '@nestjs/common';
import { ContentIssue, JSONSchemaDto, PreviewPayload, StepContentIssueEnum } from '@novu/shared';
import { merge } from 'lodash';
import { PrepareAndValidateContentCommand } from './prepare-and-validate-content.command';
import { mergeObjects } from '../../../util/jsonUtils';
import { findMissingKeys } from '../../../util/utils';
import { BuildDefaultPayloadUsecase } from '../build-payload-from-placeholder';
import { ValidatedPlaceholderAggregation, ValidatePlaceholderUsecase } from '../validate-placeholders';
import { CollectPlaceholderWithDefaultsUsecase, PlaceholderAggregation } from '../collect-placeholders';
import { ExtractDefaultValuesFromSchemaUsecase } from '../../extract-default-values-from-schema';
import { ValidatedContentResponse } from './validated-content.response';
import { toSentenceCase } from '../../../../shared/services/helper/helper.service';

@Injectable()
export class PrepareAndValidateContentUsecase {
  constructor(
    private constructPayloadUseCase: BuildDefaultPayloadUsecase,
    private validatePlaceholdersUseCase: ValidatePlaceholderUsecase,
    private collectPlaceholderWithDefaultsUsecase: CollectPlaceholderWithDefaultsUsecase,
    private extractDefaultsFromSchemaUseCase: ExtractDefaultValuesFromSchemaUsecase
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
    const issues = this.buildIssues(
      finalPayload,
      command.previewPayloadFromDto || finalPayload, // if no payload provided no point creating issues.
      defaultControlValues,
      command.controlValues,
      controlValueToValidPlaceholders
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
    const mergedControlValues = merge(defaultControlValues, this.removeEmptyValuesFromMap(controlValues));
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

  private removeEmptyValuesFromMap(controlValues: Record<string, unknown>) {
    const filteredValues: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(controlValues)) {
      if (value === null) {
        continue;
      }
      if (typeof value !== 'string') {
        filteredValues[key] = value;
        continue;
      }
      if (value.toLowerCase().trim() !== '') {
        filteredValues[key] = value;
      }
    }

    return filteredValues;
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

  private buildIssues(
    payload: PreviewPayload,
    providedPayload: PreviewPayload,
    defaultControlValues: Record<string, unknown>,
    userProvidedValues: Record<string, unknown>,
    valueToPlaceholders: Record<string, ValidatedPlaceholderAggregation>
  ): Record<string, ContentIssue[]> {
    let finalIssues: Record<string, ContentIssue[]> = {};
    finalIssues = mergeObjects(finalIssues, this.computeIllegalVariablesIssues(valueToPlaceholders));
    finalIssues = mergeObjects(finalIssues, this.getMissingInPayload(providedPayload, valueToPlaceholders, payload));
    finalIssues = mergeObjects(finalIssues, this.computeMissingControlValue(defaultControlValues, userProvidedValues));

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
            message: `${toSentenceCase(item)} is missing in payload`,
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
          message: `${toSentenceCase(item)} is missing`,
        },
      ];
    }

    return result;
  }
}
