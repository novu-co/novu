import { Injectable } from '@nestjs/common';
import { InstrumentUsecase } from '@novu/application-generic';
import { RenderCommand } from './render-command';

@Injectable()
export class ThrottleOutputRendererUsecase {
  @InstrumentUsecase()
  execute(command: RenderCommand) {
    return {
      amount: Number(command.controlValues.amount),
      timeValue: Number(command.controlValues.timeValue),
      timeUnit: command.controlValues.timeUnit as 'seconds' | 'minutes' | 'hours' | 'days',
    };
  }
}
