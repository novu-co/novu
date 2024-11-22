import { InternalServerErrorException } from '@nestjs/common';
import { type NotificationStepEntity } from '@novu/dal';

export class InvalidStepException extends InternalServerErrorException {
  constructor(currentStep: NotificationStepEntity) {
    super({ message: 'persisted step was found Invalid, potential bug to be investigated ', step: currentStep });
  }
}
