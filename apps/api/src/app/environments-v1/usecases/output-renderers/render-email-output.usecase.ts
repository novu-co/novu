import { EmailRenderOutput, TipTapNode } from '@novu/shared';
import { Injectable } from '@nestjs/common';
import { render as mailyRender } from '@maily-to/render';
import { Instrument, InstrumentUsecase } from '@novu/application-generic';
import isEmpty from 'lodash/isEmpty';
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

    const expandedSchema = this.transformForAndShowLogic(body, renderCommand.fullPayloadForRender);
    const htmlRendered = await this.renderEmail(expandedSchema);

    return { subject, body: htmlRendered };
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
