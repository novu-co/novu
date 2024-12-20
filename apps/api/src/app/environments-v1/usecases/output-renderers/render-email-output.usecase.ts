import { EmailRenderOutput, TipTapNode } from '@novu/shared';
import { Injectable } from '@nestjs/common';
import { render as mailyRender } from '@maily-to/render';
import { Instrument, InstrumentUsecase } from '@novu/application-generic';
import isEmpty from 'lodash/isEmpty';
import { Liquid } from 'liquidjs';
import { FullPayloadForRender, RenderCommand } from './render-command';
import { ExpandEmailEditorSchemaUsecase } from './expand-email-editor-schema.usecase';
import { emailStepControlZodSchema } from '../../../workflows-v2/shared';

export class RenderEmailOutputCommand extends RenderCommand {}

@Injectable()
export class RenderEmailOutputUsecase {
  constructor(private expandEmailEditorSchemaUseCase: ExpandEmailEditorSchemaUsecase) {}

  @InstrumentUsecase()
  async execute(renderCommand: RenderEmailOutputCommand): Promise<EmailRenderOutput> {
    const { body, subject } = emailStepControlZodSchema.parse(renderCommand.controlValues);

    if (isEmpty(body)) {
      return { subject, body: '' };
    }

    const expandedMailyContent = this.transformForAndShowLogic(body, renderCommand.fullPayloadForRender);
    const parsedTipTap = await this.parseTipTapNodeByLiquid(expandedMailyContent, renderCommand);
    const renderedHtml = await this.renderEmail(parsedTipTap);

    return { subject, body: renderedHtml };
  }

  private async parseTipTapNodeByLiquid(
    value: TipTapNode,
    renderCommand: RenderEmailOutputCommand
  ): Promise<TipTapNode> {
    const client = new Liquid();
    const templateString = client.parse(JSON.stringify(value));
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
  private transformForAndShowLogic(body: string, fullPayloadForRender: FullPayloadForRender) {
    return this.expandEmailEditorSchemaUseCase.execute({ emailEditorJson: body, fullPayloadForRender });
  }
}
