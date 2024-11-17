import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PlaceholderAggregation } from './placeholder.aggregation';
import { HydrateEmailSchemaUseCase } from '../../../../environments-v1/usecases/output-renderers';
import { CollectPlaceholderWithDefaultsCommand } from './collect-placeholder-with-defaults.command';
import { flattenJson } from '../../../util/jsonUtils';

@Injectable()
export class CollectPlaceholderWithDefaultsUsecase {
  constructor(private hydrateEmailSchemaUseCase: HydrateEmailSchemaUseCase) {}
  execute(command: CollectPlaceholderWithDefaultsCommand): Record<string, PlaceholderAggregation> {
    if (!command.controlValues) {
      return {};
    }
    const placeholders: Record<string, PlaceholderAggregation> = {};
    const flattenedControlValues = flattenJson(command.controlValues);

    for (const controlValueKey of Object.keys(flattenedControlValues)) {
      const flattenedControlValue = flattenedControlValues[controlValueKey];
      placeholders[controlValueKey] = this.extractPlaceholdersLogic(flattenedControlValue);
    }

    return placeholders;
  }
  private extractPlaceholdersLogic(controlValue: unknown): PlaceholderAggregation {
    let placeholders: PlaceholderAggregation;
    const parseEmailSchemaResult = this.safeAttemptToParseEmailSchema(controlValue);
    if (parseEmailSchemaResult) {
      placeholders = parseEmailSchemaResult;
    } else {
      placeholders = extractPlaceholders(controlValue);
    }

    return placeholders;
  }
  private safeAttemptToParseEmailSchema(controlValue: unknown) {
    if (typeof controlValue !== 'string') {
      return undefined;
    }
    try {
      const { placeholderAggregation } = this.hydrateEmailSchemaUseCase.execute({
        emailEditor: controlValue,
        fullPayloadForRender: {
          payload: {},
          subscriber: {},
          steps: {},
        },
      });

      return placeholderAggregation;
    } catch (e) {
      return undefined;
    }
  }
}

class PayloadDefaultsEngineFailureException extends InternalServerErrorException {
  constructor(notText: object) {
    super({ message: `placeholder engine expected string but got object`, ctx: notText });
  }
}

function extractPlaceholders(potentialText: unknown): PlaceholderAggregation {
  const placeholders = {
    nestedForPlaceholders: {},
    regularPlaceholdersToDefaultValue: {},
  };
  if (!potentialText || typeof potentialText === 'number') {
    return placeholders;
  }
  if (typeof potentialText === 'object') {
    throw new PayloadDefaultsEngineFailureException(potentialText);
  }

  if (typeof potentialText !== 'string') {
    return placeholders;
  }

  extractLiquidJSPlaceholders(potentialText).forEach((placeholderResult) => {
    placeholders.regularPlaceholdersToDefaultValue[placeholderResult.placeholder] = placeholderResult.defaultValue;
  });

  return placeholders;
}
function extractLiquidJSPlaceholders(text: string) {
  const regex = /\{\{([^}]*?)\}\}/g;
  const matches: {
    placeholder: string;
    defaultValue?: string;
  }[] = [];
  let match: RegExpExecArray | null;

  // eslint-disable-next-line no-cond-assign
  while ((match = regex.exec(text)) !== null) {
    const fullMatch = match[0];
    const innerContent = match[1].trim();
    const defaultMatch = innerContent.match(/default:\s*["']?([^"']+)["']?/);
    const defaultValue = defaultMatch ? defaultMatch[1] : fullMatch;

    const sanitizedContent = innerContent
      .replace(/(\s*\|\s*default:\s*["']?[^"']+["']?)/, '')
      .replace(/\s*\|\s*[^ ]+/g, '');

    const trimmedContent = sanitizedContent.trim();

    if (trimmedContent === '') {
      matches.push({
        placeholder: fullMatch,
        defaultValue,
      });
    } else {
      matches.push({
        placeholder: `{{${trimmedContent}}}`,
        defaultValue,
      });
    }
  }

  return matches;
}
