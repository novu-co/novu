import { JSONSchemaDto, PreviewPayload } from '@novu/shared';

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface PrepareAndValidateContentCommand {
  controlValues: Record<string, unknown>;
  controlDataSchema: JSONSchemaDto;
  variableSchema: JSONSchemaDto;
  previewPayloadFromDto?: PreviewPayload;
}
