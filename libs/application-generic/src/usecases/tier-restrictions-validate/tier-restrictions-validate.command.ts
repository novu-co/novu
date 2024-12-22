import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { DigestUnitEnum, StepTypeEnum } from '@novu/shared';
import { OrganizationLevelCommand } from '../../commands';

export class TierRestrictionsValidateCommand extends OrganizationLevelCommand {
  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsEnum(DigestUnitEnum)
  @IsOptional()
  unit?: DigestUnitEnum;

  @IsNumber()
  @IsOptional()
  deferDurationMs?: number;

  @IsOptional()
  @IsString()
  cron?: string;

  @IsEnum(StepTypeEnum)
  @IsOptional()
  stepType?: StepTypeEnum;
}
