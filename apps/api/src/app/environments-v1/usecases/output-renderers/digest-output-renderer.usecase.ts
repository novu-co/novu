import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DigestRenderOutput } from '@novu/shared';
import { InstrumentUsecase } from '@novu/application-generic';
import { RenderCommand } from './render-command';
import { parseLiquid } from '../../../shared/helpers/liquid';

@Injectable()
export class DigestOutputRendererUsecase {
  @InstrumentUsecase()
  async execute(renderCommand: RenderCommand): Promise<DigestRenderOutput> {
    const { skip, ...outputControls } = renderCommand.controlValues ?? {};
    const parsedOutputControls = await parseLiquid(outputControls, renderCommand.fullPayloadForRender);

    return parsedOutputControls as any;
  }
}
