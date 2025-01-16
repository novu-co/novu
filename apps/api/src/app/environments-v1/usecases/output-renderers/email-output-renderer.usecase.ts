import { render as mailyRender } from '@maily-to/render';
import { Injectable } from '@nestjs/common';
import { Liquid } from 'liquidjs';
import { EmailRenderOutput, TipTapNode } from '@novu/shared';
import { InstrumentUsecase } from '@novu/application-generic';
import { FullPayloadForRender, RenderCommand } from './render-command';
import { ExpandEmailEditorSchemaUsecase } from './expand-email-editor-schema.usecase';

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

export const parseLiquid = async (value: string, variables: FullPayloadForRender): Promise<string> => {
  const client = new Liquid({
    outputEscape: (output) => {
      return stringifyDataStructureWithSingleQuotes(output);
    },
  });

  const template = client.parse(value);

  return await client.render(template, variables);
};

const stringifyDataStructureWithSingleQuotes = (value: unknown, spaces: number = 0): string => {
  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
    const valueStringified = JSON.stringify(value, null, spaces);
    const valueSingleQuotes = valueStringified.replace(/"/g, "'");
    const valueEscapedNewLines = valueSingleQuotes.replace(/\n/g, '\\n');

    return valueEscapedNewLines;
  } else {
    return String(value);
  }
};
