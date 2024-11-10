import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

export class StepNotFoundException extends NotFoundException {
  constructor(stepDatabaseId: string) {
    super({ message: 'Step cannot be found using the UUID Supplied', stepDatabaseId });
  }
}
export class StepMissingControlsException extends InternalServerErrorException {
  constructor(stepDatabaseId: string, step: any) {
    super({ message: 'Step cannot be found using the UUID Supplied', stepDatabaseId, step });
  }
}
export class StepMissingStepIdException extends InternalServerErrorException {
  constructor(stepDatabaseId: string, step: any) {
    super({ message: 'Step Missing StepId', stepDatabaseId, step });
  }
}
