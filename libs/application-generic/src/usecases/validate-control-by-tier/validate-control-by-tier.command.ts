import { StepTypeEnum } from '@novu/shared/';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

import { OrganizationLevelCommand } from '../../commands';

export type Milliseconds = number;

export class ValidateControlByTierCommand extends OrganizationLevelCommand {
  @IsNumber()
  @IsOptional()
  deferDuration?: Milliseconds;

  @IsEnum(StepTypeEnum)
  @IsOptional()
  stepType?: StepTypeEnum;
}
