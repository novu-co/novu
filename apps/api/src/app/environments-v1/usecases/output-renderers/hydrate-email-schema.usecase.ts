/* eslint-disable no-param-reassign */
import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import { PreviewPayload, TipTapNode } from '@novu/shared';
import { MailyAttrsEnum, processNodeAttrs, processNodeMarks } from '@novu/application-generic';

import { HydrateEmailSchemaCommand } from './hydrate-email-schema.command';

@Injectable()
export class HydrateEmailSchemaUseCase {
  execute(command: HydrateEmailSchemaCommand): TipTapNode {
    // TODO: Aligned Zod inferred type and TipTapNode to remove the need of a type assertion
    const emailBody: TipTapNode = TipTapSchema.parse(JSON.parse(command.emailEditor)) as TipTapNode;
    if (emailBody) {
      this.transformContentInPlace([emailBody], command.fullPayloadForRender);
    }

    return emailBody;
  }

  private variableLogic(
    node: TipTapNode & {
      attrs: { id: string };
    },
    content: TipTapNode[],
    index: number
  ) {
    content[index] = {
      type: 'variable',
      text: node.attrs.id,
    };
  }

  private async forNodeLogic(
    node: TipTapNode & {
      attrs: { each: string };
    },
    content: TipTapNode[],
    index: number
  ) {
    content[index] = {
      type: 'paragraph',
      attrs: { each: node.attrs.each },
      content: node.content,
    };
  }

  private transformContentInPlace(content: TipTapNode[], masterPayload: PreviewPayload) {
    content.forEach((node, index) => {
      processNodeAttrs(node);
      processNodeMarks(node);

      if (this.isVariableNode(node)) {
        this.variableLogic(node, content, index);
      }
      if (this.isForNode(node)) {
        this.forNodeLogic(node, content, index);
      }
      if (node.content) {
        this.transformContentInPlace(node.content, masterPayload);
      }
    });
  }

  private isForNode(node: TipTapNode): node is TipTapNode & { attrs: { each: string } } {
    return !!(
      node.type === 'for' &&
      node.attrs &&
      node.attrs[MailyAttrsEnum.EACH_KEY] !== undefined &&
      typeof node.attrs.each === 'string'
    );
  }

  private isVariableNode(node: TipTapNode): node is TipTapNode & { attrs: { id: string } } {
    return !!(
      node.type === 'variable' &&
      node.attrs &&
      node.attrs[MailyAttrsEnum.ID] !== undefined &&
      typeof node.attrs.id === 'string'
    );
  }
}

export const TipTapSchema = z
  .object({
    type: z.string().optional(),
    content: z.array(z.lazy(() => TipTapSchema)).optional(),
    text: z.string().optional(),
    marks: z
      .array(
        z
          .object({
            type: z.string(),
            attrs: z.record(z.any()).optional(),
          })
          .passthrough()
      )
      .optional(),
    attrs: z.record(z.unknown()).optional(),
  })
  .passthrough();
