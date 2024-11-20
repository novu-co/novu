import { Injectable } from '@nestjs/common';
import { DelayRenderOutput } from '@novu/shared';
import { RenderCommand } from './render-command';
import {
  DelayTimeControlType,
  DelayTimeControlZodSchema,
} from '../../../workflows-v2/shared/schemas/delay-control.schema';

@Injectable()
export class DelayOutputRendererUsecase {
  execute(renderCommand: RenderCommand): DelayRenderOutput {
    const delayTimeControlType: DelayTimeControlType = DelayTimeControlZodSchema.parse(renderCommand.controlValues);

    return {
      amount: delayTimeControlType.amount,
      type: delayTimeControlType.type,
      unit: delayTimeControlType.unit,
    };
  }
}
