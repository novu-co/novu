import { ControlsSchema } from '@novu/shared';
import { ControlsKeyValue } from '@novu/dal';

export class BuildDefaultControlValuesCommand {
  controlSchema: ControlsSchema;
  controlValues?: ControlsKeyValue;
}
