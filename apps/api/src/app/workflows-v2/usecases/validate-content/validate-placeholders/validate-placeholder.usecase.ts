import { JSONSchemaDefinition, JSONSchemaDto, JSONSchemaTypeName } from '@novu/shared';
import { Injectable } from '@nestjs/common';
import { ValidatePlaceholderCommand } from './validate-placeholder.command';
import { ValidatedPlaceholderAggregation } from './validated-placeholder-aggregation';
import { PlaceholderAggregation } from '../collect-placeholders';

const PLACHOLDER_URL = 'https://www.example.com/search?query=placeholder';

@Injectable()
export class ValidatePlaceholderUsecase {
  execute(command: ValidatePlaceholderCommand): Record<string, ValidatedPlaceholderAggregation> {
    const validatedPlaceholders: Record<string, ValidatedPlaceholderAggregation> = {};
    const variablesFromSchema = extractPropertiesFromJsonSchema(command.variableSchema);
    for (const controlValueKey of Object.keys(command.controlValueToPlaceholders)) {
      const controlValue = command.controlValueToPlaceholders[controlValueKey];
      const validatedPlaceholderAggregation = this.validatePlaceholders(controlValue, variablesFromSchema);
      if (
        controlValueKey.trim().toLowerCase().includes('url') &&
        Object.keys(validatedPlaceholderAggregation.validRegularPlaceholdersToDefaultValue).length === 1
      ) {
        const keys = Object.keys(validatedPlaceholderAggregation.validRegularPlaceholdersToDefaultValue);
        const urlKey = keys[0];
        validatedPlaceholderAggregation.validRegularPlaceholdersToDefaultValue[urlKey] = PLACHOLDER_URL;
      }
      validatedPlaceholders[controlValueKey] = validatedPlaceholderAggregation;
    }

    return validatedPlaceholders;
  }

  validatePlaceholders(
    placeholderAggregation: PlaceholderAggregation,
    variablesFromSchema: ExtractedPropertiesResult
  ): ValidatedPlaceholderAggregation {
    const { problematicPlaceholders, validPlaceholders } = this.validateRegularPlaceholders(
      placeholderAggregation.regularPlaceholdersToDefaultValue,
      variablesFromSchema
    );
    const { problematicNestedPlaceholders, validNestedPlaceholders } = this.validateNestedPlaceholders(
      placeholderAggregation.nestedForPlaceholders,
      variablesFromSchema
    );

    return {
      problematicPlaceholders: { ...problematicPlaceholders, ...problematicNestedPlaceholders },
      validNestedForPlaceholders: validNestedPlaceholders,
      validRegularPlaceholdersToDefaultValue: validPlaceholders,
    };
  }

  private validateRegularPlaceholders(
    regularPlaceholdersToDefaultValue: Record<string, string>,
    variablesFromSchema: ExtractedPropertiesResult
  ) {
    const problematicPlaceholders: Record<string, string> = {};
    const validPlaceholders: Record<string, string> = {};
    for (const placeholder of Object.keys(regularPlaceholdersToDefaultValue)) {
      const { errorMsg } = this.validateSingleRegularPlaceholder(variablesFromSchema, placeholder);
      if (errorMsg === undefined) {
        validPlaceholders[placeholder] = regularPlaceholdersToDefaultValue[placeholder];
      } else {
        problematicPlaceholders[placeholder] = errorMsg;
      }
    }

    return { problematicPlaceholders, validPlaceholders };
  }
  private validateNestedPlaceholders(
    iterativePlaceholderToNestedPlaceholders: Record<string, Record<string, string>>,
    variablesFromSchema: ExtractedPropertiesResult
  ) {
    const problematicNestedPlaceholders: Record<string, string> = {};
    const validNestedPlaceholders: Record<string, Record<string, string>> = {};

    for (const [arrayPlaceholder, nestedPlaceholderArray] of Object.entries(iterativePlaceholderToNestedPlaceholders)) {
      const isPredefinedArray = Object.keys(variablesFromSchema.arrayProperties).includes(arrayPlaceholder);

      if (!isPredefinedArray && !this.searchPlaceholderObjectPrefix(variablesFromSchema, arrayPlaceholder)) {
        problematicNestedPlaceholders[arrayPlaceholder] =
          `Error: Placeholder "${arrayPlaceholder}" is not defined in the schema.`;
        continue;
      }

      validNestedPlaceholders[arrayPlaceholder] = {};

      for (const nestedPlaceholder of Object.keys(nestedPlaceholderArray)) {
        const { errorMsg } = this.validateNested(variablesFromSchema, arrayPlaceholder, nestedPlaceholder);

        if (errorMsg === undefined) {
          validNestedPlaceholders[arrayPlaceholder][nestedPlaceholder] =
            iterativePlaceholderToNestedPlaceholders[arrayPlaceholder][nestedPlaceholder];
        } else {
          problematicNestedPlaceholders[nestedPlaceholder] = errorMsg;
        }
      }
    }

    return { problematicNestedPlaceholders, validNestedPlaceholders };
  }

  private validateSingleRegularPlaceholder(
    variablesFromSchema: ExtractedPropertiesResult,
    placeholder: string
  ): { errorMsg?: string } {
    const errorMsg = validateLiquidPlaceholder(placeholder);
    if (errorMsg) {
      return { errorMsg };
    }
    const isPredefinedVariable = variablesFromSchema.primitiveProperties.includes(this.cleanString(placeholder));
    if (isPredefinedVariable) {
      return {};
    }
    const prefixFromVariableSchema = this.searchPlaceholderObjectPrefix(variablesFromSchema, placeholder);
    if (prefixFromVariableSchema) {
      return {};
    }

    return { errorMsg: `Error: Placeholder "${placeholder}" is not defined in the schema.` };
  }

  private searchPlaceholderObjectPrefix(variablesFromSchema: ExtractedPropertiesResult, placeholder: string) {
    return variablesFromSchema.objectProperties.some((prefix) => {
      return this.cleanString(placeholder).startsWith(prefix);
    });
  }
  private cleanString(input: string): string {
    return input.replace(/^{{\s*(.*?)\s*}}$/, '$1');
  }
  private validateNested(
    variablesFromSchema: ExtractedPropertiesResult,
    arrayPlaceholder: string,
    nestedPlaceholder: string
  ) {
    const cleanNestedPlaceholder = this.cleanString(nestedPlaceholder);
    if (!cleanNestedPlaceholder.startsWith('item.')) {
      return { errorMsg: `Error: Nested placeholder "${nestedPlaceholder}" must start with "item.".` };
    }
    const placeholderWithoutTheItemPrefix = cleanNestedPlaceholder.slice(5);
    const res = variablesFromSchema.arrayProperties[arrayPlaceholder];
    if (!res) {
      return {};
    }
    if (res.primitiveProperties.includes(placeholderWithoutTheItemPrefix)) {
      return {};
    }
    const prefixFromVariableSchema = res.objectProperties.some((prefix) =>
      placeholderWithoutTheItemPrefix.startsWith(prefix)
    );
    if (prefixFromVariableSchema) {
      return {};
    }

    return { errorMsg: `Error: Placeholder "${nestedPlaceholder}" is not defined in the schema.` };
  }
}
const VALID_VARIABLE_REGEX: RegExp = /^[a-zA-Z_][\w.-]*$/;
const NESTED_PLACEHOLDER_REGEX: RegExp = /\{\{.*\{\{.*\}\}.*\}\}/;
const FILTER_REGEX: RegExp = /\|/;
const RESERVED_WORDS: string[] = [
  'for',
  'if',
  'unless',
  'case',
  'when',
  'endif',
  'endfor',
  'endcase',
  'capture',
  'assign',
  'include',
  'layout',
  'block',
  'comment',
  'raw',
];

function validateLiquidPlaceholder(placeholder: string): string | undefined {
  if (!placeholder.startsWith('{{') || !placeholder.endsWith('}}')) {
    return ERROR_MESSAGES.invalidFormat;
  }

  const content: string = placeholder.slice(2, -2).trim();

  if (content === '') {
    return ERROR_MESSAGES.empty;
  }

  if (NESTED_PLACEHOLDER_REGEX.test(content)) {
    return ERROR_MESSAGES.nestedPlaceholders;
  }

  if (!VALID_VARIABLE_REGEX.test(content)) {
    return ERROR_MESSAGES.invalidCharacters;
  }

  if (content.startsWith('.') || content.endsWith('.')) {
    return ERROR_MESSAGES.invalidDotUsage;
  }

  if (content.includes('..')) {
    return ERROR_MESSAGES.consecutiveDots;
  }

  if (FILTER_REGEX.test(content)) {
    const parts: string[] = content.split('|').map((part) => part.trim());
    for (const part of parts) {
      if (!VALID_VARIABLE_REGEX.test(part) && part !== '') {
        return ERROR_MESSAGES.invalidFilter(part);
      }
    }
    if (content.includes('||')) {
      return ERROR_MESSAGES.incorrectPipeUsage;
    }
    if (content.endsWith('|')) {
      return ERROR_MESSAGES.incompleteFilter;
    }
  }

  if ((content.match(/\{\{/g) || []).length !== (content.match(/\}\}/g) || []).length) {
    return ERROR_MESSAGES.unbalancedBraces;
  }

  if (RESERVED_WORDS.includes(content)) {
    return ERROR_MESSAGES.reservedWord(content);
  }

  return undefined;
}
// eslint-disable-next-line @typescript-eslint/naming-convention
interface ExtractedPropertiesResult {
  objectProperties: string[];
  primitiveProperties: string[];
  arrayProperties: Record<string, ExtractedPropertiesResult>;
}
function extractPropertiesFromJsonSchema(jsonSchema: JSONSchemaDto): ExtractedPropertiesResult {
  const objectProperties: string[] = [];
  const primitiveProperties: string[] = [];
  const arrayProperties: Record<string, ExtractedPropertiesResult> = {};

  const isPrimitiveType = (type?: JSONSchemaTypeName | JSONSchemaTypeName[]): boolean => {
    return ['string', 'number', 'integer', 'boolean', 'null'].includes(type as string);
  };

  const traverseProperties = (properties?: { [key: string]: JSONSchemaDefinition }, parentKey = ''): void => {
    if (!properties) return;

    for (const [key, value] of Object.entries(properties)) {
      const currentKey = parentKey ? `${parentKey}.${key}` : key;

      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value.type) && value.type.includes('object')) {
          objectProperties.push(currentKey);
        } else if (value.type === 'object') {
          objectProperties.push(currentKey);
        }

        if (value.properties) {
          traverseProperties(value.properties, currentKey);
        }
      }

      if (value && typeof value !== 'boolean' && isPrimitiveType(value.type)) {
        primitiveProperties.push(currentKey);
      }

      if (value && typeof value !== 'boolean' && value.type === 'array') {
        arrayProperties[currentKey] = {
          objectProperties: [],
          primitiveProperties: [],
          arrayProperties: {},
        };

        if (value.items) {
          if (Array.isArray(value.items)) {
            // Handle when items is an array of schemas
            value.items.forEach((item) => {
              if (typeof item === 'object' && item !== null && item.type === 'object' && item.properties) {
                traverseProperties(item.properties, key);
              }
            });
          } else if (typeof value.items === 'object') {
            // Handle when items is a single schema
            if (
              value.items.type === 'object' ||
              (Array.isArray(value.items.type) && value.items.type.includes('object'))
            ) {
              if (value.items.properties) {
                traverseProperties(value.items.properties, key);
              }
            }
          }
        }
      }
    }
  };

  if (jsonSchema.properties) {
    traverseProperties(jsonSchema.properties);
  }

  return {
    objectProperties,
    primitiveProperties,
    arrayProperties,
  };
}
const ERROR_MESSAGES = {
  invalidFormat: 'Error: Placeholder must start with {{ and end with }}.',
  empty: 'Error: Placeholder cannot be empty. Please provide a valid variable name.',
  nestedPlaceholders: 'Error: Nested placeholders are not allowed. Please remove any nested {{ }}.',
  invalidCharacters:
    // eslint-disable-next-line max-len
    'Error: Placeholder contains invalid characters. A valid placeholder can only include letters, numbers, underscores, dots, and hyphens.',
  invalidDotUsage: 'Error: Placeholder cannot start or end with a dot. Please adjust the variable name.',
  consecutiveDots: 'Error: Placeholder cannot contain consecutive dots. Please correct the variable name.',
  invalidFilter: (part: string) =>
    `Error: Invalid filter or variable name "${part}". Filters must be valid variable names.`,
  incorrectPipeUsage: 'Error: Incorrect pipe usage. Please ensure filters are applied correctly.',
  incompleteFilter: 'Error: Incomplete filter syntax. Please provide a valid filter name.',
  unbalancedBraces: 'Error: Unbalanced curly braces found. Please ensure all curly braces are properly closed.',
  reservedWord: (word: string) => `Error: "${word}" is a reserved word and cannot be used as a variable name.`,
};
