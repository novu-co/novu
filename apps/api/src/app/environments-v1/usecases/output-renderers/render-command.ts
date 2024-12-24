import { BaseCommand } from '@novu/application-generic';

export class RenderCommand extends BaseCommand {
  controlValues: Record<string, unknown>;
  fullPayloadForRender: FullPayloadForRender;
}
export class FullPayloadForRender {
  subscriber: Record<string, unknown>;
  payload: Record<string, unknown>;
  steps: Record<string, unknown>; // step.stepId.unknown
}
