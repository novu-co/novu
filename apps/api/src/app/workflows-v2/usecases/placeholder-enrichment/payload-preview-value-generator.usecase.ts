import { Injectable } from '@nestjs/common';
import { AddKeysToPayloadBasedOnHydrationStrategyCommand } from './add-keys-to-payload-based-on-hydration-strategy-command';
import { HydrateEmailSchemaUseCase } from '../../../environments-v1/usecases/output-renderers';
import {
  BuildPayloadNestedStructureCommand,
  BuildPayloadNestedStructureUsecase,
} from './buildPayloadNestedStructureUsecase';
import { PayloadDefaultsEngineFailureException } from './payload-defaults-engine-failure.exception';

const unsupportedPrefixes: string[] = ['actor', 'steps'];
@Injectable()
export class CreateMockPayloadForSingleControlValueUseCase {
  constructor(
    private readonly transformPlaceholderMapUseCase: BuildPayloadNestedStructureUsecase,
    private hydrateEmailSchemaUseCase: HydrateEmailSchemaUseCase
  ) {}
  public execute(command: AddKeysToPayloadBasedOnHydrationStrategyCommand): Record<string, unknown> {
    const { controlValues, controlValueKey } = command;

    if (!controlValues) {
      return {};
    }

    const controlValue = controlValues[controlValueKey];
    const payloadFromEmailSchema = this.safeAttemptToParseEmailSchema(controlValue);
    if (payloadFromEmailSchema) {
      return payloadFromEmailSchema;
    }

    return this.buildPayloadForRegularText(controlValue);
  }

  private safeAttemptToParseEmailSchema(controlValue: string) {
    try {
      const { nestedPayload } = this.hydrateEmailSchemaUseCase.execute({
        emailEditor: controlValue,
        fullPayloadForRender: {
          payload: {},
          subscriber: {},
          steps: {},
        },
      });

      return nestedPayload;
    } catch (e) {
      return undefined;
    }
  }

  private buildPayloadForRegularText(controlValue: unknown) {
    const placeholders = extractPlaceholders(controlValue).filter(
      (placeholder) => !unsupportedPrefixes.some((prefix) => placeholder.startsWith(prefix))
    );

    return this.transformPlaceholderMapUseCase.execute(
      BuildPayloadNestedStructureCommand.create({ placeholdersDotNotation: placeholders })
    );
  }
}

export function extractPlaceholders(potentialText: unknown): string[] {
  if (!potentialText || typeof potentialText === 'number') {
    return [];
  }
  if (typeof potentialText === 'object') {
    throw new PayloadDefaultsEngineFailureException(potentialText);
  }

  if (typeof potentialText !== 'string') {
    return [];
  }

  const regex = /\{\{\{(.*?)\}\}\}|\{\{(.*?)\}\}|\{#(.*?)#\}/g; // todo: add support for nested placeholders
  const matches: string[] = [];
  let match: RegExpExecArray | null;

  // eslint-disable-next-line no-cond-assign
  while ((match = regex.exec(potentialText)) !== null) {
    const placeholder = match[1] || match[2] || match[3];
    if (placeholder) {
      matches.push(placeholder.trim());
    }
  }

  return matches;
}
function convertToRecord(keys: string[]): Record<string, any> {
  return keys.reduce(
    (acc, key) => {
      acc[key] = ''; // You can set the value to any default value you want

      return acc;
    },
    {} as Record<string, any>
  );
}
