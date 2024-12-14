import { EmailRenderOutput, TipTapNode } from '@novu/shared';
import { Injectable } from '@nestjs/common';
import { render as mailyRender } from '@maily-to/render';
import { Instrument, InstrumentUsecase } from '@novu/application-generic';
import { FullPayloadForRender, RenderCommand } from './render-command';
import { ExpandEmailEditorSchemaUsecase } from './expand-email-editor-schema.usecase';

export class RenderEmailOutputCommand extends RenderCommand {}

@Injectable()
export class RenderEmailOutputUsecase {
  constructor(private expandEmailEditorSchemaUseCase: ExpandEmailEditorSchemaUsecase) {}

  @InstrumentUsecase()
  async execute(renderCommand: RenderEmailOutputCommand): Promise<EmailRenderOutput> {
    const expandedSchema = this.transformForAndShowLogic(
      renderCommand.controlValues.emailEditor as unknown as string,
      renderCommand.fullPayloadForRender
    );
    const htmlRendered = await this.renderEmail(expandedSchema);

    return {
      subject: renderCommand.controlValues.subject as unknown as string,
      body: htmlRendered,
    };
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
