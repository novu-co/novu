import { render as mailyRender } from '@maily-to/render';
import isEmpty from 'lodash/isEmpty';
import { Injectable } from '@nestjs/common';
import { Liquid } from 'liquidjs';

import { EmailRenderOutput, TipTapNode } from '@novu/shared';
import { Instrument, InstrumentUsecase } from '@novu/application-generic';

import { FullPayloadForRender, RenderCommand } from './render-command';
import { ExpandEmailEditorSchemaUsecase } from './expand-email-editor-schema.usecase';
import { emailControlZodSchema } from '../../../workflows-v2/shared/schemas/email-control.schema';

export class RenderEmailOutputCommand extends RenderCommand {}

@Injectable()
// todo rename to EmailOutputRenderer
export class RenderEmailOutputUsecase {
  constructor(private expandEmailEditorSchemaUseCase: ExpandEmailEditorSchemaUsecase) {}

  @InstrumentUsecase()
  async execute(renderCommand: RenderEmailOutputCommand): Promise<EmailRenderOutput> {
    const { body, subject } = emailControlZodSchema.parse(renderCommand.controlValues);

    if (isEmpty(body)) {
      return { subject, body: '' };
    }

    const expandedMailyContent = this.transformMailyDynamicBlocks(body, renderCommand.fullPayloadForRender);
    const parsedTipTap = await this.parseTipTapNodeByLiquid(expandedMailyContent, renderCommand);
    const renderedHtml = await this.renderEmail(parsedTipTap);

    return { subject, body: renderedHtml };
  }

  private async parseTipTapNodeByLiquid(
    tiptapNode: TipTapNode,
    renderCommand: RenderEmailOutputCommand
  ): Promise<TipTapNode> {
    const client = new Liquid({
      outputEscape: (output) => {
        return stringifyDataStructureWithSingleQuotes(output);
      },
    });
    const templateString = client.parse(JSON.stringify(tiptapNode));
    const parsedTipTap = await client.render(templateString, {
      payload: renderCommand.fullPayloadForRender.payload,
      subscriber: renderCommand.fullPayloadForRender.subscriber,
      steps: renderCommand.fullPayloadForRender.steps,
    });

    return JSON.parse(parsedTipTap);
  }

  @Instrument()
  private renderEmail(content: TipTapNode): Promise<string> {
    return mailyRender(content);
  }

  @Instrument()
  private transformMailyDynamicBlocks(body: string, fullPayloadForRender: FullPayloadForRender) {
    return this.expandEmailEditorSchemaUseCase.execute({ emailEditorJson: body, fullPayloadForRender });
  }
}

export const stringifyDataStructureWithSingleQuotes = (value: unknown, spaces: number = 0): string => {
  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
    const valueStringified = JSON.stringify(value, null, spaces);
    const valueSingleQuotes = valueStringified.replace(/"/g, "'");
    const valueEscapedNewLines = valueSingleQuotes.replace(/\n/g, '\\n');

    return valueEscapedNewLines;
  } else {
    return String(value);
  }
};
