import { ApiProperty } from '@nestjs/swagger'; // Ensure you have the correct import for ApiProperty
import { ConstraintValidation } from '@novu/application-generic';

export class ErrorDto {
  @ApiProperty({
    description: 'HTTP status code of the error response.',
    example: 404,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Timestamp of when the error occurred.',
    example: '2024-12-12T13:00:00Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'The path where the error occurred.',
    example: '/api/v1/resource',
  })
  path: string;

  @ApiProperty({
    description: 'A detailed error message.',
    example: 'Resource not found.',
  })
  message: string;

  @ApiProperty({
    description: 'Optional context object for additional error details.',
    type: 'object',
    required: false,
    additionalProperties: true,
    example: {
      workflowId: 'some_wf_id',
      stepId: 'some_wf_id',
    },
  })
  ctx?: object | Object;

  /**
   * Optional unique identifier for the error, useful for tracking using Sentry and New Relic, only available for 500.
   */
  @ApiProperty({
    description: `Optional unique identifier for the error, useful for tracking using Sentry and 
      New Relic, only available for 500.`,
    example: 'abc123',
    required: false,
  })
  errorId?: string;
}

export class ValidationErrorDto extends ErrorDto {
  @ApiProperty({
    description: 'A record of validation errors keyed by field name',
    type: 'object',
    additionalProperties: {
      type: 'object',
      properties: {
        messages: {
          type: 'array',
          items: { type: 'string' },
        },
        value: {
          oneOf: [
            {
              type: 'string',
              nullable: true, // Allows value to be null
            },
            { type: 'number' },
            { type: 'boolean' },
            { type: 'object', additionalProperties: true },
            { type: 'array', items: { type: 'object', additionalProperties: true } },
          ],
        },
      },
      required: ['messages', 'value'],
      example: {
        messages: ['Field is required', 'Invalid format'],
        value: 'xx xx xx ',
      },
    },
    example: {
      fieldName1: {
        messages: ['Field is required', 'Must be a valid email address'],
        value: 'invalidEmail',
      },
      fieldName2: {
        messages: ['Must be at least 18 years old'],
        value: 17,
      },
      fieldName3: {
        messages: ['Must be a boolean value'],
        value: true,
      },
      fieldName4: {
        messages: ['Must be a valid object'],
        value: { key: 'value' },
      },
    },
  })
  errors: Record<string, ConstraintValidation>;
}
