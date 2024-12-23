import { Injectable } from '@nestjs/common';
import { DelayRenderOutput } from '@novu/shared';
import { InstrumentUsecase } from '@novu/application-generic';
import { RenderCommand } from './render-command';
import { delayControlZodSchema, DelayControlType } from '../../../workflows-v2/shared/schemas/delay-control.schema';

@Injectable()
export class DelayOutputRendererUsecase {
  @InstrumentUsecase()
  execute(renderCommand: RenderCommand): DelayRenderOutput {
    const delayControlType: DelayControlType = delayControlZodSchema.parse(renderCommand.controlValues);

    return {
      amount: delayControlType.amount as number,
      type: delayControlType.type,
      unit: delayControlType.unit,
    };
  }
}
