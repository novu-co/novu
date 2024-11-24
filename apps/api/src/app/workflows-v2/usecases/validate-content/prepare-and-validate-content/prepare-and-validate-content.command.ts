import { EnvironmentWithUserObjectCommand } from '@novu/application-generic';
import { JSONSchemaDto, PreviewPayload, StepTypeEnum } from '@novu/shared';

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface PrepareAndValidateContentCommand extends EnvironmentWithUserObjectCommand {
  controlValues: Record<string, unknown>;
  controlDataSchema: JSONSchemaDto;
  variableSchema: JSONSchemaDto;
  previewPayloadFromDto?: PreviewPayload;
  stepType?: StepTypeEnum;
}
