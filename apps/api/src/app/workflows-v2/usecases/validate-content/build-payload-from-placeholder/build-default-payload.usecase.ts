import { Injectable } from '@nestjs/common';
import { merge } from 'lodash';
import { BuildDefaultPayloadCommand } from './build-default-payload.command';
import { BuildDefaultPayloadResponse } from './build-default-payload.response';
import { ValidatedPlaceholderAggregation } from '../validate-placeholders';

@Injectable()
export class BuildDefaultPayloadUsecase {
  execute(command: BuildDefaultPayloadCommand): BuildDefaultPayloadResponse {
    let localPayload: Record<string, unknown> = {};
    for (const placeholderAggregator of command.placeholderAggregators) {
      const regularPayload = this.buildRegularPayload(placeholderAggregator);
      const nestedPayload = this.buildNestedPayload(placeholderAggregator);
      localPayload = merge(merge(localPayload, regularPayload), nestedPayload);
    }

    return { previewPayload: localPayload };
  }

  private buildRegularPayload(placeholderAggregator: ValidatedPlaceholderAggregation) {
    return removeBracketsAndFlattenToNested(placeholderAggregator.validRegularPlaceholdersToDefaultValue);
  }

  private buildNestedPayload(placeholderAggregator: ValidatedPlaceholderAggregation) {
    const innerPlaceholdersResolved = this.removeNesting(placeholderAggregator.validNestedForPlaceholders);

    return removeBracketsAndFlattenToNested(innerPlaceholdersResolved);
  }

  private removeNesting(nestedForPlaceholders: Record<string, Record<string, string>>): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    Object.keys(nestedForPlaceholders).forEach((key) => {
      const nestedItemsResolved = removeBracketsAndFlattenToNested(nestedForPlaceholders[key]);
      const nestedItemsResolvedWithoutPrefix = nestedItemsResolved.item as Record<string, unknown>;
      const item1 = this.addSuffixToValues(nestedItemsResolvedWithoutPrefix, '1');
      const item2 = this.addSuffixToValues(nestedItemsResolvedWithoutPrefix, '2');
      result[key] = [item1, item2];
    });

    return result;
  }
  private addSuffixToValues(optionalParams: Record<string, unknown>, suffix: string): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    Object.keys(optionalParams).forEach((key) => {
      const value = optionalParams[key];

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = this.addSuffixToValues(value as Record<string, unknown>, suffix);
      } else {
        result[key] = `${value}-${suffix}`;
      }
    });

    return result;
  }
}
function removeBracketsAndFlattenToNested(input: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  Object.keys(input).forEach((key) => {
    const cleanedKey = key.replace(/^\{\{|\}\}$/g, '');

    const keys = cleanedKey.split('.');
    keys.reduce((acc, part, index) => {
      if (index === keys.length - 1) {
        acc[part] = input[key];
      } else {
        acc[part] = acc[part] || {};
      }

      return acc[part];
    }, result);
  });

  return result;
}
