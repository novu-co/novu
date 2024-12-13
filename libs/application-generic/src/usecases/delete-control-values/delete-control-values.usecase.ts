import { Injectable } from '@nestjs/common';
import { ControlValuesRepository } from '@novu/dal';
import { ControlValuesLevelEnum } from '@novu/shared';
import { DeleteControlValuesCommand } from './delete-control-values.command';
import { Instrument, InstrumentUsecase } from '../../instrumentation';

@Injectable()
export class DeleteControlValuesUseCase {
  constructor(private controlValuesRepository: ControlValuesRepository) {}

  @InstrumentUsecase()
  public async execute(command: DeleteControlValuesCommand): Promise<void> {
    const existingControlValues = await this.controlValuesRepository.findOne({
      _environmentId: command.environmentId,
      _organizationId: command.organizationId,
      _workflowId: command.workflowId,
      _stepId: command.stepId,
      level: ControlValuesLevelEnum.STEP_CONTROLS,
    });

    if (!existingControlValues) {
      return;
    }

    await this.deleteControlValues(command, existingControlValues._id);
  }

  @Instrument()
  private async deleteControlValues(
    command: DeleteControlValuesCommand,
    controlValuesId: string,
  ) {
    return await this.controlValuesRepository.delete({
      _id: controlValuesId,
      _organizationId: command.organizationId,
      _workflowId: command.workflowId,
      _stepId: command.stepId,
      level: ControlValuesLevelEnum.STEP_CONTROLS,
    });
  }
}
