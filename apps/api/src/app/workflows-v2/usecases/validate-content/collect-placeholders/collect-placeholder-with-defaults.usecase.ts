import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { WorkflowOriginEnum } from '@novu/shared';
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
    let placeholders: Record<string, PlaceholderAggregation> = {};
    const flattenedControlValues = flattenJson(command.controlValues);

    for (const [controlValueKey, flattenedControlValue] of Object.entries(flattenedControlValues)) {
      placeholders[controlValueKey] = this.extractPlaceholdersLogic(flattenedControlValue);
    }

    if (command.origin === WorkflowOriginEnum.EXTERNAL) {
      placeholders = this.filterPayloadVariables(placeholders);
      const payloadPlaceholders: Record<string, PlaceholderAggregation> = this.buildPayloadPlaceholders(command);
      placeholders = { ...placeholders, ...payloadPlaceholders };
    }

    return placeholders;
  }

  private buildPayloadPlaceholders(command: CollectPlaceholderWithDefaultsCommand) {
    const payloadPlaceholders: Record<string, PlaceholderAggregation> = {
      payloadPlaceholder: {
        nestedForPlaceholders: {},
        regularPlaceholdersToDefaultValue: {},
      },
    };

    for (const [key, value] of Object.entries(command.payloadSchema?.properties || {})) {
      payloadPlaceholders.payloadPlaceholder.regularPlaceholdersToDefaultValue[`{{payload.${key}}}`] =
        typeof value === 'boolean' ? `{{payload.${key}}}` : (value.default as string);
    }

    return payloadPlaceholders;
  }

  private filterPayloadVariables(
    placeholders: Record<string, PlaceholderAggregation>
  ): Record<string, PlaceholderAggregation> {
    const resultPlaceholders = { ...placeholders };
    for (const placeholderAggregation of Object.values(resultPlaceholders)) {
      const regularPlaceholders = placeholderAggregation.regularPlaceholdersToDefaultValue;
      const nestedPlaceholders = placeholderAggregation.nestedForPlaceholders;

      placeholderAggregation.regularPlaceholdersToDefaultValue = Object.fromEntries(
        Object.entries(regularPlaceholders).filter(([key]) => !key.includes('{{payload.'))
      );
      placeholderAggregation.nestedForPlaceholders = Object.fromEntries(
        Object.entries(nestedPlaceholders).filter(([key]) => !key.includes('{{payload.'))
      );
    }

    return resultPlaceholders;
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
