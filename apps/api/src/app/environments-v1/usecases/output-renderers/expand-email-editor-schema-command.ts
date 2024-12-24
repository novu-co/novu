import { BaseCommand } from '@novu/application-generic';
import { FullPayloadForRender } from './render-command';

export class ExpandEmailEditorSchemaCommand extends BaseCommand {
  emailEditorJson: string;
  fullPayloadForRender: FullPayloadForRender;
}
