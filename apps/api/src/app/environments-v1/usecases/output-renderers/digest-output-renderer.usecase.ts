import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DigestRenderOutput } from '@novu/shared';
import { RenderCommand } from './render-command';
import {
  DigestControlSchemaType,
  DigestControlZodSchema,
  isDigestRegularControl,
  isDigestTimedControl,
} from '../../../workflows-v2/shared/schemas/digest-control.schema';

@Injectable()
export class DigestOutputRendererUsecase {
  execute(renderCommand: RenderCommand): DigestRenderOutput {
    const parse: DigestControlSchemaType = DigestControlZodSchema.parse(renderCommand.controlValues);
    if (
      isDigestRegularControl(parse) &&
      parse.amount &&
      parse.unit &&
      parse.lookBackWindow &&
      parse.lookBackWindow.amount &&
      parse.lookBackWindow.unit
    ) {
      return {
        amount: parse.amount,
        unit: parse.unit,
        digestKey: parse.digestKey,
        lookBackWindow: {
          amount: parse.lookBackWindow.amount,
          unit: parse.lookBackWindow.unit,
        },
      };
    }
    if (isDigestTimedControl(parse) && parse.cron) {
      return {
        cron: parse.cron,
        digestKey: parse.digestKey,
      };
    }
    throw new InternalServerErrorException({
      message: `Invalid digest control value data sent for rendering`,
      controlValues: renderCommand.controlValues,
    });
  }
}
