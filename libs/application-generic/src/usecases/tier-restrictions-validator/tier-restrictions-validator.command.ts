import { IsEnum, IsNumber, IsOptional } from 'class-validator';

import { StepTypeEnum } from '@novu/shared';
import { OrganizationLevelCommand } from '../../commands';

export type Milliseconds = number;

export class TierRestrictionsValidatorCommand extends OrganizationLevelCommand {
  @IsNumber()
  @IsOptional()
  deferDuration?: Milliseconds;

  @IsEnum(StepTypeEnum)
  @IsOptional()
  stepType?: StepTypeEnum;
}
