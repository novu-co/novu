import { Injectable } from '@nestjs/common';
import { ContentIssue, JSONSchemaDto, PreviewPayload, StepContentIssueEnum } from '@novu/shared';
import { merge } from 'lodash';
import { PrepareAndValidateContentCommand } from './prepare-and-validate-content.command';
import { flattenJson, flattenToNested, mergeObjects } from '../../../util/jsonUtils';
import { findMissingKeys } from '../../../util/utils';
import { BuildDefaultPayloadUsecase } from '../build-payload-from-placeholder';
import { ValidatedPlaceholderAggregation, ValidatePlaceholderUsecase } from '../validate-placeholders';
import { CollectPlaceholderWithDefaultsUsecase, PlaceholderAggregation } from '../collect-placeholders';
import { ExtractDefaultValuesFromSchemaUsecase } from '../../extract-default-values-from-schema';
import { ValidatedContentResponse } from './validated-content.response';
import { toSentenceCase } from '../../../../shared/services/helper/helper.service';
import { isValidUrlForActionButton } from '../../../util/url-utils';

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
    const { finalControlValues, controlValueIssues } = this.mergeAndSanitizeControlValues(
      command.controlDataSchema,
      command.controlValues,
      controlValueToValidPlaceholders
    );
    const issues = this.buildIssues(
      finalPayload,
      command.previewPayloadFromDto || finalPayload, // if no payload provided no point creating issues.
      controlValueToValidPlaceholders,
      controlValueIssues
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
    jsonSchemaDto: JSONSchemaDto, // Now using JsonSchemaDto
    controlValues: Record<string, unknown>,
    controlValueToValidPlaceholders: Record<string, ValidatedPlaceholderAggregation>
  ) {
    const defaultControlValues = this.extractDefaultsFromSchemaUseCase.execute({ jsonSchemaDto });

    let flatSanitizedControlValues: Record<string, unknown> = flattenJson(controlValues);
    const controlValueToContentIssues: Record<string, ContentIssue[]> = {};

    this.overloadMissingRequiredValuesIssues(
      defaultControlValues,
      flatSanitizedControlValues,
      controlValueToContentIssues
    );

    flatSanitizedControlValues = this.removeEmptyValuesFromMap(flatSanitizedControlValues);
    flatSanitizedControlValues = this.removeIllegalValuesAndOverloadIssues(
      flatSanitizedControlValues,
      controlValueToValidPlaceholders,
      controlValueToContentIssues
    );
    flatSanitizedControlValues = this.removeIllegalPlaceholdersFromValues(
      flatSanitizedControlValues,
      controlValueToValidPlaceholders,
      controlValueToContentIssues
    );
    const finalControlValues = merge(defaultControlValues, flatSanitizedControlValues);
    const nestedJson = flattenToNested(finalControlValues);

    return {
      defaultControlValues,
      finalControlValues: nestedJson,
      controlValueIssues: controlValueToContentIssues,
    };
  }

  private removeIllegalPlaceholdersFromValues(
    sanitizedIncomingControlValues: Record<string, unknown>,
    controlValueToValidPlaceholders: Record<string, ValidatedPlaceholderAggregation>,
    controlValueToContentIssues: Record<string, ContentIssue[]>
  ) {
    const finalControlValuesSanitized: Record<string, unknown> = { ...sanitizedIncomingControlValues };
    Object.keys(sanitizedIncomingControlValues).forEach((controlValueKey) => {
      const controlValue = sanitizedIncomingControlValues[controlValueKey];

      if (typeof controlValue !== 'string') {
        return;
      }

      const placeholders = controlValueToValidPlaceholders[controlValueKey];
      if (!placeholders) {
        return;
      }
      finalControlValuesSanitized[controlValueKey] = this.cleanFromBadPlaceholders(
        controlValue,
        placeholders,
        controlValueToContentIssues,
        controlValueKey
      );
    });

    return finalControlValuesSanitized;
  }

  private cleanFromBadPlaceholders(
    controlValue: string,
    placeholders: ValidatedPlaceholderAggregation,
    controlValueToContentIssues: Record<string, ContentIssue[]>,
    controlValueKey: string
  ) {
    let cleanedControlValue = controlValue; // Initialize cleanedControlValue with the original controlValue

    for (const problematicPlaceholder of Object.keys(placeholders.problematicPlaceholders)) {
      this.addToIssues(
        controlValueToContentIssues,
        controlValueKey,
        StepContentIssueEnum.ILLEGAL_VARIABLE_IN_CONTROL_VALUE,
        `Illegal variable in control value: ${problematicPlaceholder}`,
        problematicPlaceholder
      );
      cleanedControlValue = this.removePlaceholdersFromText(problematicPlaceholder, cleanedControlValue);
    }

    return cleanedControlValue;
  }

  private addToIssues(
    controlValueToContentIssues: Record<string, ContentIssue[]>,
    controlValueKey: string,
    issueEnum: StepContentIssueEnum,
    msg: string,
    variable: string | undefined
  ) {
    if (!controlValueToContentIssues[controlValueKey]) {
      // eslint-disable-next-line no-param-reassign
      controlValueToContentIssues[controlValueKey] = [];
    }
    controlValueToContentIssues[controlValueKey].push({
      issueType: issueEnum,
      variableName: variable,
      message: msg,
    });
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
    valueToPlaceholders: Record<string, ValidatedPlaceholderAggregation>,
    urlControlValueIssues: Record<string, ContentIssue[]>
  ): Record<string, ContentIssue[]> {
    let finalIssues: Record<string, ContentIssue[]> = {};
    finalIssues = mergeObjects(finalIssues, this.getMissingInPayload(providedPayload, valueToPlaceholders, payload));
    finalIssues = mergeObjects(finalIssues, urlControlValueIssues);

    return finalIssues;
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

  private overloadMissingRequiredValuesIssues(
    defaultControlValues: Record<string, unknown>,
    userProvidedValues: Record<string, unknown>,
    controlValueToContentIssues: Record<string, ContentIssue[]>
  ) {
    const missingControlKeys = findMissingKeys(defaultControlValues, userProvidedValues);
    for (const item of missingControlKeys) {
      this.addToIssues(
        controlValueToContentIssues,
        item,
        StepContentIssueEnum.MISSING_VALUE,
        `${toSentenceCase(item)} is missing`,
        item
      );
    }
  }

  private removeIllegalValuesAndOverloadIssues(
    sanitizedIncomingControlValues: Record<string, unknown>,
    controlValueToValidPlaceholders: Record<string, ValidatedPlaceholderAggregation>,
    controlValueToContentIssues: Record<string, ContentIssue[]>
  ) {
    const finalSanitizedControlValues = { ...sanitizedIncomingControlValues };
    Object.keys(sanitizedIncomingControlValues).forEach((controlValueKey) => {
      const controlValue = sanitizedIncomingControlValues[controlValueKey];
      if (
        controlValueKey.includes('url') &&
        typeof controlValue === 'string' &&
        !isValidUrlForActionButton(controlValue)
      ) {
        const hasNoPlaceholders = this.getHasNoPlaceholders(controlValueToValidPlaceholders, controlValueKey);
        if (hasNoPlaceholders) {
          finalSanitizedControlValues[controlValueKey] =
            'https://www.not-good-url-please-replace.com/redirect?from=problematic-url&to=updated-url';

          // eslint-disable-next-line no-param-reassign
          controlValueToContentIssues[controlValueKey] = [
            {
              issueType: StepContentIssueEnum.INVALID_URL,
              variableName: controlValue,
              message: `Invalid URL: [[${controlValue}]]`,
            },
          ];
        }
      }
    });

    return finalSanitizedControlValues;
  }

  private getHasNoPlaceholders(
    controlValueToValidPlaceholders: Record<string, ValidatedPlaceholderAggregation>,
    controlValueKey: string
  ) {
    return (
      Object.keys(controlValueToValidPlaceholders[controlValueKey].validRegularPlaceholdersToDefaultValue).length === 0
    );
  }
}
