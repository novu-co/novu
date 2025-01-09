/* eslint-disable no-param-reassign */
import { TipTapNode } from '@novu/shared';
import { Injectable } from '@nestjs/common';
import { MailyAttrsEnum } from '@novu/application-generic';
import { ExpandEmailEditorSchemaCommand } from './expand-email-editor-schema-command';
import { HydrateEmailSchemaUseCase } from './hydrate-email-schema.usecase';
import { parseLiquid } from './email-output-renderer.usecase';

@Injectable()
export class ExpandEmailEditorSchemaUsecase {
  constructor(private hydrateEmailSchemaUseCase: HydrateEmailSchemaUseCase) {}

  async execute(command: ExpandEmailEditorSchemaCommand): Promise<TipTapNode> {
    const emailSchemaHydrated = this.hydrate(command);

    return await this.processShowAndForControls(
      command.fullPayloadForRender as unknown as Record<string, unknown>,
      emailSchemaHydrated
    );
  }

  private hydrate(command: ExpandEmailEditorSchemaCommand) {
    const { hydratedEmailSchema } = this.hydrateEmailSchemaUseCase.execute({
      emailEditor: command.emailEditorJson,
      fullPayloadForRender: command.fullPayloadForRender,
    });

    return hydratedEmailSchema;
  }

  private async processShowAndForControls(
    variables: Record<string, unknown>,
    node: TipTapNode,
    parentNode?: TipTapNode
  ): Promise<TipTapNode> {
    if (node.content) {
      const processedContent: TipTapNode[] = [];
      for (const innerNode of node.content) {
        const processed = await this.processShowAndForControls(variables, innerNode, parentNode);
        if (processed) {
          processedContent.push(processed);
        }
      }
      node.content = processedContent;
    }

    if (this.hasShow(node)) {
      await this.hideShowIfNeeded(variables, node, parentNode);
    } else if (this.hasEach(node)) {
      const newContent = this.expendedForEach(node);
      node.content = newContent;
      if (parentNode && parentNode.content) {
        this.insertArrayAt(parentNode.content, parentNode.content.indexOf(node), newContent);
        parentNode.content.splice(parentNode.content.indexOf(node), 1);
      }
    }

    return node;
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

  private hasShow(node: TipTapNode): node is TipTapNode & { attrs: { [MailyAttrsEnum.SHOW_IF_KEY]: string } } {
    return node.attrs?.[MailyAttrsEnum.SHOW_IF_KEY] !== undefined;
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

  private async hideShowIfNeeded(
    variables: Record<string, unknown>,
    node: TipTapNode & { attrs: { [MailyAttrsEnum.SHOW_IF_KEY]: unknown } },
    parentNode?: TipTapNode
  ): Promise<void> {
    const { [MailyAttrsEnum.SHOW_IF_KEY]: showIfKey } = node.attrs;

    if (showIfKey === undefined) {
      return;
    }

    const parsedShowIfValue = await parseLiquid(showIfKey as string, variables);
    const showIfValueBoolean =
      typeof parsedShowIfValue === 'boolean' ? parsedShowIfValue : this.stringToBoolean(parsedShowIfValue);

    if (!showIfValueBoolean) {
      this.removeNodeFromParent(node, parentNode);
    } else {
      delete node.attrs[MailyAttrsEnum.SHOW_IF_KEY];
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
