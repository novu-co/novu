import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, ValidateNested, IsDefined, IsOptional } from 'class-validator';

import { PreferencesRequestDto, StepCreateDto, WorkflowCommonsFields } from './workflow-commons-fields';
import { WorkflowCreationSourceEnum } from '../../types';

export class CreateWorkflowDto extends WorkflowCommonsFields {
  @ValidateNested({ each: true })
  @Type(() => StepCreateDto)
  @IsDefined()
  steps: StepCreateDto[];

  @IsEnum(WorkflowCreationSourceEnum)
  @IsNotEmpty()
  __source: WorkflowCreationSourceEnum;

  @IsOptional()
  preferences?: PreferencesRequestDto;
}
