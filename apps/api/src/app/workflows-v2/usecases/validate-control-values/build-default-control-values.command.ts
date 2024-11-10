import { ControlsSchema } from '@novu/shared';

export class BuildDefaultControlValuesCommand {
  controlSchema: ControlsSchema;
  controlValues: Record<string, unknown>;
}
