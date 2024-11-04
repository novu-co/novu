/* eslint-disable @typescript-eslint/naming-convention */

export interface TipTapNode {
  type: string;
  content?: TipTapNode[];
  text?: string;
  attr?: Record<string, unknown>;
}

export interface EmailStepControlSchemaDto {
  emailEditor: string;
  subject: string;
}
