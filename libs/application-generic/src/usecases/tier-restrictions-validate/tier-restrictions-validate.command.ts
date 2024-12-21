import { IsEnum, IsNumber, IsOptional } from 'class-validator';

import { DigestUnitEnum, StepTypeEnum } from '@novu/shared';
import { OrganizationLevelCommand } from '../../commands';

export class TierRestrictionsValidateCommand extends OrganizationLevelCommand {
  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsEnum(DigestUnitEnum)
  @IsOptional()
  unit?: DigestUnitEnum;

  @IsEnum(StepTypeEnum)
  @IsOptional()
  stepType?: StepTypeEnum;
}
