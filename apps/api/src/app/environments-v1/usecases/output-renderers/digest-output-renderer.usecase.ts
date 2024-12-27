import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DigestRenderOutput } from '@novu/shared';
import { InstrumentUsecase } from '@novu/application-generic';
import { RenderCommand } from './render-command';

@Injectable()
export class DigestOutputRendererUsecase {
  @InstrumentUsecase()
  execute(renderCommand: RenderCommand): DigestRenderOutput {
    const { skip, ...outputControls } = renderCommand.controlValues ?? {};

    if (outputControls.length === 0) {
      throw new InternalServerErrorException({
        message: `Invalid digest control value data sent for rendering`,
        controlValues: renderCommand.controlValues,
      });
    }

    return outputControls as any;
  }
}
