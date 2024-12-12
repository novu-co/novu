import { IsEnum, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { MAX_NAME_LENGTH } from '@novu/application-generic';
import { StepTypeEnum } from '@novu/shared';

export class UpsertStepDataCommand {
  @IsString()
  @IsNotEmpty()
  @Length(1, MAX_NAME_LENGTH)
  name: string;

  @IsEnum(StepTypeEnum)
  type: StepTypeEnum;

  @IsOptional()
  controlValues?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  _id?: string;
}
