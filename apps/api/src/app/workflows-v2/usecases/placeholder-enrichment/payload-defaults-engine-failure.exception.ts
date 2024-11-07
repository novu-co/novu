import { InternalServerErrorException } from '@nestjs/common';

export class PayloadDefaultsEngineFailureException extends InternalServerErrorException {
  constructor(notATextControlValue: object) {
    super({ message: `Payload Default construct, Control value is not a primitive: `, notATextControlValue });
  }
}
