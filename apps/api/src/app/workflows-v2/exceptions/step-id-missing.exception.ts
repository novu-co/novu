import { InternalServerErrorException } from '@nestjs/common';

export class StepIdMissingException extends InternalServerErrorException {
  constructor(workflowId: string) {
    super({ message: `StepId is missing for the workflowId: ${workflowId}`, workflowId });
  }
}

export class OriginMissingException extends InternalServerErrorException {
  constructor(workflowId: string) {
    super({
      message: 'Origin is missing on the workflow',
      workflowId,
    });
  }
}
