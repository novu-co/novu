import {
  IsEnum,
  IsNumber,
  IsOptional,
  isString,
  IsString,
} from 'class-validator';

import { DigestUnitEnum, StepTypeEnum } from '@novu/shared';
import { OrganizationLevelCommand } from '../../commands';

export class TierRestrictionsValidateCommand extends OrganizationLevelCommand {
  @IsString()
  @IsOptional()
  amount?: string;

  @IsString()
  @IsOptional()
  unit?: string;

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
