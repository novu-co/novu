import { EnvironmentWithUserObjectCommand } from '@novu/application-generic';
import { StepTypeEnum } from '@novu/shared/';

export class ValidateControlByTierCommand extends EnvironmentWithUserObjectCommand {
  controlValues: Record<string, unknown>;
  stepType?: StepTypeEnum;
}
