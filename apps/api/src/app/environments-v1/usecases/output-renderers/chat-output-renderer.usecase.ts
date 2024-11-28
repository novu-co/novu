// Concrete Renderer for Chat Preview
import { ChatRenderOutput } from '@novu/shared';
import { Injectable } from '@nestjs/common';
import { InstrumentUsecase } from '@novu/application-generic';
import { RenderCommand } from './render-command';

@Injectable()
export class ChatOutputRendererUsecase {
  @InstrumentUsecase()
  execute(renderCommand: RenderCommand): ChatRenderOutput {
    const body = renderCommand.controlValues.body as string;

    return { body };
  }
}
