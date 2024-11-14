import { ControlsKeyValue } from '@novu/dal';
import { JSONSchemaDto, PreviewPayload } from '@novu/shared';

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface PrepareAndValidateContentCommand {
  controlValues?: ControlsKeyValue;
  controlDataSchema: JSONSchemaDto;
  variableSchema: JSONSchemaDto;
  previewPayloadFromDto?: PreviewPayload;
}
