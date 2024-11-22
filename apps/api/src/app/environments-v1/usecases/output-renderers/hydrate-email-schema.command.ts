// New HydrateEmailSchemaUseCase class

import { type FullPayloadForRender } from './render-command';

export class HydrateEmailSchemaCommand {
  emailEditor: string;
  fullPayloadForRender: FullPayloadForRender;
}
