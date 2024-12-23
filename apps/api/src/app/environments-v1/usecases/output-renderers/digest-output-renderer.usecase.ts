import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DigestRenderOutput } from '@novu/shared';
import { InstrumentUsecase } from '@novu/application-generic';
import { RenderCommand } from './render-command';
import {
  DigestControlSchemaType,
  digestControlZodSchema,
  isDigestRegularControl,
  isDigestTimedControl,
} from '../../../workflows-v2/shared/schemas/digest-control.schema';

@Injectable()
export class DigestOutputRendererUsecase {
  @InstrumentUsecase()
  execute(renderCommand: RenderCommand): DigestRenderOutput {
    const parse: DigestControlSchemaType = digestControlZodSchema.parse(renderCommand.controlValues);
    if (isDigestRegularControl(parse) && parse.amount && parse.unit) {
      return {
        amount: parse.amount as number,
        unit: parse.unit,
        digestKey: parse.digestKey,
        ...(parse.lookBackWindow && {
          amount: parse.lookBackWindow.amount,
          unit: parse.lookBackWindow.unit,
        }),
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
