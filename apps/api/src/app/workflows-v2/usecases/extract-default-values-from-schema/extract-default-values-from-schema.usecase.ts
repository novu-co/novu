import { JSONSchemaDto } from '@novu/shared';
import { Injectable } from '@nestjs/common';
import { ExtractDefaultValuesFromSchemaCommand } from './extract-default-values-from-schema.command';
import { isMatchingJsonSchema } from '../../util/jsonToSchema';

@Injectable()
export class ExtractDefaultValuesFromSchemaUsecase {
  /**
   * Executes the use case to extract default values from the JSON Schema.
   * @param command - The command containing the JSON Schema DTO.
   * @returns A nested JSON structure with field paths and their default values.
   */
  execute(command: ExtractDefaultValuesFromSchemaCommand): Record<string, unknown> {
    const { jsonSchemaDto, controlValues } = command;
    if (!jsonSchemaDto) {
      return {};
    }

    return this.extractDefaults(jsonSchemaDto, controlValues);
  }

  private extractDefaults(schema: JSONSchemaDto, controlValues: Record<string, unknown>): Record<string, any> {
    const result: Record<string, any> = {};

    if (schema.properties) {
      for (const [key, value] of Object.entries(schema.properties)) {
        if (typeof value !== 'object') {
          continue;
        }
        const isRequired = schema.required ? schema.required.includes(key) : false;
        if (!isRequired) {
          continue;
        }

        result[key] = this.getValue(value, key);

        const nestedDefaults = this.extractDefaults(value, controlValues);
        if (Object.keys(nestedDefaults).length > 0) {
          result[key] = { ...result[key], ...nestedDefaults };
        }
      }
    } else if (schema.anyOf && schema.anyOf.length > 0) {
      /*
       * If control values do match the schema, we should return the default values from that schema.
       * Otherwise return the default values from the first one
       */
      const fistSchemaMatch = schema.anyOf.find((item) => {
        return isMatchingJsonSchema(item, controlValues);
      });
      if (typeof fistSchemaMatch === 'object') {
        return this.extractDefaults(fistSchemaMatch, controlValues);
      } else if (typeof schema.anyOf[0] === 'object') {
        return this.extractDefaults(schema.anyOf[0], controlValues);
      }
    }

    return result;
  }

  private getValue(value: JSONSchemaDto, key: string) {
    const normalizedKey = key.toLowerCase().trim();

    if (value.default != null) {
      return value.default;
    }

    // TODO: Move this to a default value in the step controls schema.
    if (normalizedKey.includes('url')) {
      return 'https://www.example.com/search?query=placeholder';
    }

    return null;
  }
}

function isJSONSchemaDto(schema: any): schema is JSONSchemaDto {
  return schema && typeof schema === 'object' && 'type' in schema;
}
