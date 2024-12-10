import { JSONSchemaDto, PreviewIssueEnum, TipTapNode } from '@novu/shared';
import { Injectable } from '@nestjs/common';
import { ExtractDefaultValuesFromSchemaCommand } from './extract-default-values-from-schema.command';

const DEFAULT_PREVIEW_ISSUE_MESSAGE: TipTapNode = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      attrs: {
        textAlign: 'left',
      },
      content: [
        {
          type: 'text',
          text: PreviewIssueEnum.PREVIEW_ISSUE_REQUIRED_CONTROL_VALUE_IS_MISSING,
        },
      ],
    },
  ],
};

@Injectable()
export class ExtractDefaultValuesFromSchemaUsecase {
  /**
   * Executes the use case to extract default values from the JSON Schema.
   * @param command - The command containing the JSON Schema DTO.
   * @returns A nested JSON structure with field paths and their default values.
   */
  execute(command: ExtractDefaultValuesFromSchemaCommand): Record<string, unknown> {
    const { jsonSchemaDto } = command;
    if (!jsonSchemaDto) {
      return {};
    }

    return this.extractDefaults(jsonSchemaDto);
  }

  private extractDefaults(schema: JSONSchemaDto): Record<string, any> {
    const result: Record<string, any> = {};

    if (schema.properties) {
      for (const [key, value] of Object.entries(schema.properties)) {
        if (!isJSONSchemaDto(value)) {
          continue;
        }
        const isRequired = schema.required ? schema.required.includes(key) : false;
        if (!isRequired) {
          continue;
        }

        result[key] = this.getValue(value, key);

        const nestedDefaults = this.extractDefaults(value);
        if (Object.keys(nestedDefaults).length > 0) {
          result[key] = { ...result[key], ...nestedDefaults };
        }
      }
    }

    return result;
  }

  private getValue(value: JSONSchemaDto, key: string) {
    const normalizedKey = key.toLowerCase().trim();

    if (value.default != null) {
      return value.default;
    }

    if (normalizedKey.includes('url')) {
      return 'https://www.example.com/search?query=placeholder';
    }

    if (normalizedKey.includes('emaileditor')) {
      return JSON.stringify(DEFAULT_PREVIEW_ISSUE_MESSAGE);
    }

    return PreviewIssueEnum.PREVIEW_ISSUE_REQUIRED_CONTROL_VALUE_IS_MISSING;
  }
}

function isJSONSchemaDto(schema: any): schema is JSONSchemaDto {
  return schema && typeof schema === 'object' && 'type' in schema;
}
