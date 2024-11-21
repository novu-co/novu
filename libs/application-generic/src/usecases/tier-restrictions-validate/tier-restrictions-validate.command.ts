import { IsEnum, IsNumber, IsOptional } from 'class-validator';

import { StepTypeEnum } from '@novu/shared';
import { OrganizationLevelCommand } from '../../commands';

export class TierRestrictionsValidateCommand extends OrganizationLevelCommand {
  @IsNumber()
  @IsOptional()
  deferDurationMs?: number;

  @IsEnum(StepTypeEnum)
  @IsOptional()
  stepType?: StepTypeEnum;
}
