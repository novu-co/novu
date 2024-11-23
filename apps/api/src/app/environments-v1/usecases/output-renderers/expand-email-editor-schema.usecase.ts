/* eslint-disable no-param-reassign */
import { TipTapNode } from '@novu/shared';
import { Injectable } from '@nestjs/common';
import { ExpandEmailEditorSchemaCommand } from './expand-email-editor-schema-command';
import { HydrateEmailSchemaUseCase } from './hydrate-email-schema.usecase';

@Injectable()
export class ExpandEmailEditorSchemaUsecase {
  constructor(private hydrateEmailSchemaUseCase: HydrateEmailSchemaUseCase) {}

  execute(command: ExpandEmailEditorSchemaCommand): TipTapNode {
    const emailSchemaHydrated = this.hydrate(command);
    this.processShowAndForControls(emailSchemaHydrated, undefined);

    return emailSchemaHydrated;
  }
  private hydrate(command: ExpandEmailEditorSchemaCommand) {
    const { hydratedEmailSchema } = this.hydrateEmailSchemaUseCase.execute({
      emailEditor: command.emailEditorJson,
      fullPayloadForRender: command.fullPayloadForRender,
    });

    return hydratedEmailSchema;
  }

  private processShowAndForControls(node: TipTapNode, parentNode?: TipTapNode) {
    if (node.content) {
      node.content.forEach((innerNode) => {
        this.processShowAndForControls(innerNode, node);
      });
    }
    if (this.hasShow(node)) {
      this.hideShowIfNeeded(node, parentNode);
    } else if (this.hasEach(node)) {
      const newContent = this.expendedForEach(node);
      node.content = newContent;
      if (parentNode && parentNode.content) {
        this.insertArrayAt(parentNode.content, parentNode.content.indexOf(node), newContent);
        parentNode.content.splice(parentNode.content.indexOf(node), 1);
      }
    }
  }
  private insertArrayAt(array: any[], index: number, newArray: any[]) {
    if (index < 0 || index > array.length) {
      throw new Error('Index out of bounds');
    }
    array.splice(index, 0, ...newArray);
  }

  private hasEach(node: TipTapNode): node is TipTapNode & { attrs: { each: unknown } } {
    return !!(node.attrs && 'each' in node.attrs);
  }

  private hasShow(node: TipTapNode): node is TipTapNode & { attrs: { show: string } } {
    return !!(node.attrs && 'show' in node.attrs);
  }

  private regularExpansion(eachObject: any, templateContent: TipTapNode[]): TipTapNode[] {
    const expandedContent: TipTapNode[] = [];
    const jsonArrOfValues = eachObject as unknown as [{ [key: string]: string }];

    for (const value of jsonArrOfValues) {
      const hydratedContent = this.replacePlaceholders(templateContent, value);
      expandedContent.push(...hydratedContent);
    }

    return expandedContent;
  }

  private isOrderedList(templateContent: TipTapNode[]) {
    return templateContent.length === 1 && templateContent[0].type === 'orderedList';
  }

  private isBulletList(templateContent: TipTapNode[]) {
    return templateContent.length === 1 && templateContent[0].type === 'bulletList';
  }

  private expendedForEach(node: TipTapNode & { attrs: { each: unknown } }): TipTapNode[] {
    const eachObject = node.attrs.each;
    const templateContent = node.content || [];

    /*
     * Due to maily limitations in the current implementation, the location of the for
     * element is situated on the container of the list making the list a
     *  child of the for element, if we iterate it we will get the
     *  wrong behavior of multiple lists instead of list with multiple items.
     * due to that when we choose the content to iterate in case we find a list we drill down additional level
     * and iterate on the list items
     * this prevents us from
     * 1. item1
     * 1. item2
     *
     * and turns it into
     * 1.item1
     * 2.item2
     * which is the correct behavior
     *
     */
    if ((this.isOrderedList(templateContent) || this.isBulletList(templateContent)) && templateContent[0].content) {
      return [{ ...templateContent[0], content: this.regularExpansion(eachObject, templateContent[0].content) }];
    }

    return this.regularExpansion(eachObject, templateContent);
  }

  private removeNodeFromParent(node: TipTapNode, parentNode?: TipTapNode) {
    if (parentNode && parentNode.content) {
      parentNode.content.splice(parentNode.content.indexOf(node), 1);
    }
  }

  private hideShowIfNeeded(node: TipTapNode & { attrs: { show: unknown } }, parentNode?: TipTapNode): void {
    const { show } = node.attrs;
    const shouldShow = typeof show === 'boolean' ? show : this.stringToBoolean(show);

    if (!shouldShow) {
      this.removeNodeFromParent(node, parentNode);
    } else {
      delete node.attrs.show;
    }
  }

  private stringToBoolean(value: unknown): boolean {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }

    return false;
  }

  private isAVariableNode(newNode: TipTapNode): newNode is TipTapNode & { attrs: { id: string } } {
    return newNode.type === 'payloadValue' && newNode.attrs?.id !== undefined;
  }

  private replacePlaceholders(nodes: TipTapNode[], payload: Record<string, any>): TipTapNode[] {
    return nodes.map((node) => {
      const newNode: TipTapNode = { ...node };

      if (this.isAVariableNode(newNode)) {
        const valueByPath = this.getValueByPath(payload, newNode.attrs.id);
        if (valueByPath) {
          newNode.text = valueByPath;
          newNode.type = 'text';
          // @ts-ignore
          delete newNode.attrs;
        }
      } else if (newNode.content) {
        newNode.content = this.replacePlaceholders(newNode.content, payload);
      }

      return newNode;
    });
  }

  private getValueByPath(obj: Record<string, any>, path: string): any {
    if (path in obj) {
      return obj[path];
    }

    const keys = path.split('.');

    return keys.reduce((currentObj, key) => {
      if (currentObj && typeof currentObj === 'object' && key in currentObj) {
        return currentObj[key];
      }

      return undefined;
    }, obj);
  }
}
