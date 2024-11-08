import type { JSONSchema } from 'json-schema-to-ts';

export type WorkflowTestDataResponseDto = {
  to: JSONSchema;
  payload: JSONSchema;
};
