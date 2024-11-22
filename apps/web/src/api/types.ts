import { type IconName } from '@fortawesome/fontawesome-svg-core';
import { type IBlueprint } from '@novu/shared';

export interface IBlueprintTemplate extends IBlueprint {
  iconName: IconName;
}
