// Concrete Renderer for SMS Preview
import { SmsRenderOutput } from '@novu/shared';
import { Injectable } from '@nestjs/common';
import { InstrumentUsecase } from '@novu/application-generic';
import { RenderCommand } from './render-command';

@Injectable()
export class SmsOutputRendererUsecase {
  @InstrumentUsecase()
  execute(renderCommand: RenderCommand): SmsRenderOutput {
    const body = renderCommand.controlValues.body as string;

    return { body };
  }
}
