import { IsDefined, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import {
  PreferencesRequestDto,
  StepCreateDto,
  StepDto,
  StepUpdateDto,
  WorkflowCommonsFields,
} from './workflow-commons-fields';

export class UpdateWorkflowDto extends WorkflowCommonsFields {
  updatedAt: string;

  @Type(() => StepDto)
  @ValidateNested({ each: true })
  steps: (StepCreateDto | StepUpdateDto)[];

  @IsDefined()
  preferences: PreferencesRequestDto;
}
