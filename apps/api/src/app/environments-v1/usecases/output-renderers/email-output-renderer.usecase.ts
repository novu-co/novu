import { render as mailyRender } from '@maily-to/render';
import { Injectable } from '@nestjs/common';
import { EmailRenderOutput, TipTapNode } from '@novu/shared';
import { InstrumentUsecase } from '@novu/application-generic';
import { RenderCommand } from './render-command';
import { ExpandEmailEditorSchemaUsecase } from './expand-email-editor-schema.usecase';
import { parseLiquid } from '../../../shared/helpers/liquid';

export class EmailOutputRendererCommand extends RenderCommand {}

@Injectable()
export class EmailOutputRendererUsecase {
  constructor(private expandEmailEditorSchemaUseCase: ExpandEmailEditorSchemaUsecase) {}

  @InstrumentUsecase()
  async execute(renderCommand: EmailOutputRendererCommand): Promise<EmailRenderOutput> {
    const { body, subject } = renderCommand.controlValues;

    if (!body || typeof body !== 'string') {
      /**
       * Force type mapping in case undefined control.
       * This passes responsibility to framework to throw type validation exceptions
       * rather than handling invalid types here.
       */
      return {
        subject: subject as string,
        body: body as string,
      };
    }

    const expandedMailyContent = await this.expandEmailEditorSchemaUseCase.execute({
      emailEditorJson: body,
      fullPayloadForRender: renderCommand.fullPayloadForRender,
    });
    const parsedTipTap = await this.parseTipTapNodeByLiquid(expandedMailyContent, renderCommand);
    const renderedHtml = await mailyRender(parsedTipTap);

    /**
     * Force type mapping in case undefined control.
     * This passes responsibility to framework to throw type validation exceptions
     * rather than handling invalid types here.
     */
    return { subject: subject as string, body: renderedHtml };
  }

  private async parseTipTapNodeByLiquid(
    tiptapNode: TipTapNode,
    renderCommand: EmailOutputRendererCommand
  ): Promise<TipTapNode> {
    const parsedString = await parseLiquid(JSON.stringify(tiptapNode), renderCommand.fullPayloadForRender);

    return JSON.parse(parsedString);
  }
}
