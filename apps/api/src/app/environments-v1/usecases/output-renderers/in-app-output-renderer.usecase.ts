import { InAppRenderOutput } from '@novu/shared';
import { Injectable } from '@nestjs/common';
import { InstrumentUsecase } from '@novu/application-generic';
import { RenderCommand } from './render-command';
import { parseLiquid } from '../../../shared/helpers/liquid';

@Injectable()
export class InAppOutputRendererUsecase {
  @InstrumentUsecase()
  async execute(renderCommand: RenderCommand): Promise<InAppRenderOutput> {
    const { skip, disableOutputSanitization, ...outputControls } = renderCommand.controlValues ?? {};
    const parsedOutputControls = await parseLiquid(outputControls, renderCommand.fullPayloadForRender);

    return parsedOutputControls as any;
  }
}
