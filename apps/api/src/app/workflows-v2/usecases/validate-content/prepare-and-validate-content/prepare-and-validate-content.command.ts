import { JSONSchemaDto, PreviewPayload, WorkflowOriginEnum } from '@novu/shared';

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface PrepareAndValidateContentCommand {
  controlValues: Record<string, unknown>;
  controlDataSchema: JSONSchemaDto;
  variableSchema: JSONSchemaDto;

  // variable values from the dto
  previewPayloadFromDto?: PreviewPayload;

  origin: WorkflowOriginEnum;
}
