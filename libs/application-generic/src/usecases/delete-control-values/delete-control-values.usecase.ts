import { Injectable } from '@nestjs/common';
import { ControlValuesRepository } from '@novu/dal';
import { ControlValuesLevelEnum } from '@novu/shared';
import { DeleteControlValuesCommand } from './delete-control-values.command';
import { InstrumentUsecase } from '../../instrumentation';

@Injectable()
export class DeleteControlValuesUseCase {
  constructor(private controlValuesRepository: ControlValuesRepository) {}

  @InstrumentUsecase()
  public async execute(command: DeleteControlValuesCommand): Promise<void> {
    await this.controlValuesRepository.delete({
      _environmentId: command.environmentId,
      _organizationId: command.organizationId,
      _workflowId: command.workflowId,
      _stepId: command.stepId,
      level: ControlValuesLevelEnum.STEP_CONTROLS,
    });
  }
}
