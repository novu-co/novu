import { Injectable } from '@nestjs/common';
import { PushRenderOutput } from '@novu/shared';
import { InstrumentUsecase } from '@novu/application-generic';
import { RenderCommand } from './render-command';
import { parseLiquid } from '../../../shared/helpers/liquid';

@Injectable()
export class PushOutputRendererUsecase {
  @InstrumentUsecase()
  async execute(renderCommand: RenderCommand): Promise<PushRenderOutput> {
    const { skip, ...outputControls } = renderCommand.controlValues ?? {};
    const parsedOutputControls = await parseLiquid(outputControls, renderCommand.fullPayloadForRender);

    return parsedOutputControls as any;
  }
}
