/* eslint-disable no-param-reassign */
import { Injectable } from '@nestjs/common';
import { PreviewPayload, TipTapNode } from '@novu/shared';
import { z } from 'zod';
import { HydrateEmailSchemaCommand } from './hydrate-email-schema.command';

@Injectable()
export class HydrateEmailSchemaUseCase {
  execute(command: HydrateEmailSchemaCommand): {
    hydratedEmailSchema: TipTapNode;
    nestedPayload: Record<string, unknown>;
  } {
    const defaultPayload: Record<string, unknown> = {};
    const emailEditorSchema: TipTapNode = TipTapSchema.parse(JSON.parse(command.emailEditor));
    if (emailEditorSchema.content) {
      this.transformContentInPlace(emailEditorSchema.content, defaultPayload, command.fullPayloadForRender);
    }

    return { hydratedEmailSchema: emailEditorSchema, nestedPayload: this.flattenToNested(defaultPayload) };
  }

  private variableLogic(
    masterPayload: PreviewPayload,
    node: TipTapNode & { attrs: { id: string } },
    defaultPayload: Record<string, unknown>,
    content: TipTapNode[],
    index: number
  ) {
    const resolvedValueRegularPlaceholder = this.getResolvedValueRegularPlaceholder(masterPayload, node);
    defaultPayload[node.attrs.id] = resolvedValueRegularPlaceholder;
    content[index] = {
      type: 'text',
      text: resolvedValueRegularPlaceholder,
    };
  }

  private forNodeLogic(
    node: TipTapNode & { attrs: { each: string } },
    masterPayload: PreviewPayload,
    defaultPayload: Record<string, unknown>,
    content: TipTapNode[],
    index: number
  ) {
    const itemPointerToDefaultRecord = this.collectAllItemPlaceholders(node);
    const resolvedValueForPlaceholder = this.getResolvedValueForPlaceholder(
      masterPayload,
      node,
      itemPointerToDefaultRecord
    );
    defaultPayload[node.attrs.each] = resolvedValueForPlaceholder;
    content[index] = {
      type: 'for',
      attrs: { each: resolvedValueForPlaceholder },
      content: node.content,
    };
  }

  private showLogic(
    masterPayload: PreviewPayload,
    node: TipTapNode & { attrs: { show: string } },
    defaultPayload: Record<string, unknown>
  ) {
    const resolvedValueShowPlaceholder = this.getResolvedValueShowPlaceholder(masterPayload, node);
    defaultPayload[node.attrs.show] = resolvedValueShowPlaceholder;
    node.attrs.show = resolvedValueShowPlaceholder;
  }

  private transformContentInPlace(
    content: TipTapNode[],
    defaultPayload: Record<string, unknown>,
    masterPayload: PreviewPayload
  ) {
    content.forEach((node, index) => {
      if (this.isVariableNode(node)) {
        this.variableLogic(masterPayload, node, defaultPayload, content, index);
      }
      if (this.isForNode(node)) {
        this.forNodeLogic(node, masterPayload, defaultPayload, content, index);
      }
      if (this.isShowNode(node)) {
        this.showLogic(masterPayload, node, defaultPayload);
      }
      if (node.content) {
        this.transformContentInPlace(node.content, defaultPayload, masterPayload);
      }
    });
  }

  private isForNode(node: TipTapNode): node is TipTapNode & { attrs: { each: string } } {
    return !!(node.type === 'for' && node.attrs && 'each' in node.attrs && typeof node.attrs.each === 'string');
  }

  private isShowNode(node: TipTapNode): node is TipTapNode & { attrs: { show: string } } {
    return !!(node.attrs && 'show' in node.attrs && typeof node.attrs.show === 'string');
  }

  private isVariableNode(node: TipTapNode): node is TipTapNode & { attrs: { id: string } } {
    return !!(node.type === 'variable' && node.attrs && 'id' in node.attrs && typeof node.attrs.id === 'string');
  }

  private getResolvedValueRegularPlaceholder(masterPayload: PreviewPayload, node) {
    const resolvedValue = this.getValueByPath(masterPayload, node.attrs.id);
    const { fallback } = node.attrs;

    return resolvedValue || fallback || `{{${node.attrs.id}}}`;
  }

  private getResolvedValueShowPlaceholder(masterPayload: PreviewPayload, node) {
    const resolvedValue = this.getValueByPath(masterPayload, node.attrs.show);
    const { fallback } = node.attrs;

    return resolvedValue || fallback || `true`;
  }

  private flattenToNested(flatJson: Record<string, any>): Record<string, any> {
    const nestedJson: Record<string, any> = {};
    // eslint-disable-next-line guard-for-in
    for (const key in flatJson) {
      const keys = key.split('.');
      keys.reduce((acc, part, index) => {
        if (index === keys.length - 1) {
          acc[part] = flatJson[key];
        } else if (!acc[part]) {
          acc[part] = {};
        }

        return acc[part];
      }, nestedJson);
    }

    return nestedJson;
  }

  private getResolvedValueForPlaceholder(
    masterPayload: PreviewPayload,
    node: TipTapNode & { attrs: { each: string } },
    itemPointerToDefaultRecord: Record<string, string>
  ) {
    const resolvedValue = this.getValueByPath(masterPayload, node.attrs.each);

    if (!resolvedValue) {
      return [this.buildElement(itemPointerToDefaultRecord, '1'), this.buildElement(itemPointerToDefaultRecord, '2')];
    }

    return resolvedValue;
  }

  private collectAllItemPlaceholders(nodeExt: TipTapNode) {
    const payloadValues = {};
    const traverse = (node: TipTapNode) => {
      if (node.type === 'for') {
        return;
      }
      if (this.isPayloadValue(node)) {
        const { id } = node.attrs;
        payloadValues[node.attrs.id] = node.attrs.fallback || `{{item.${id}}}`;
      }
      if (node.content && Array.isArray(node.content)) {
        node.content.forEach(traverse);
      }
    };
    nodeExt.content?.forEach(traverse);

    return payloadValues;
  }

  private getValueByPath(obj: Record<string, any>, path: string): any {
    const keys = path.split('.');

    return keys.reduce((currentObj, key) => {
      if (currentObj && typeof currentObj === 'object' && key in currentObj) {
        const nextObj = currentObj[key];

        return nextObj;
      }

      return undefined;
    }, obj);
  }

  private buildElement(itemPointerToDefaultRecord: Record<string, string>, suffix: string) {
    const mockPayload: Record<string, any> = {};
    Object.keys(itemPointerToDefaultRecord).forEach((key) => {
      const keys = key.split('.');
      let current = mockPayload;
      keys.forEach((innerKey, index) => {
        if (!current[innerKey]) {
          current[innerKey] = {};
        }
        if (index === keys.length - 1) {
          current[innerKey] = itemPointerToDefaultRecord[key] + suffix;
        } else {
          current = current[innerKey];
        }
      });
    });

    return mockPayload;
  }

  private isPayloadValue(node: TipTapNode): node is { type: 'payloadValue'; attrs: { id: string; fallback?: string } } {
    return !!(node.type === 'payloadValue' && node.attrs && typeof node.attrs.id === 'string');
  }
}

export const TipTapSchema = z.object({
  type: z.string().optional(),
  content: z.array(z.lazy(() => TipTapSchema)).optional(),
  text: z.string().optional(),
  attrs: z.record(z.unknown()).optional(),
});
