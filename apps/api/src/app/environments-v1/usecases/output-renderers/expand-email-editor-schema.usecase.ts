/* eslint-disable no-param-reassign */
import { TipTapNode } from '@novu/shared';
import { Injectable } from '@nestjs/common';
import { MAILY_ITERABLE_MARK, MailyAttrsEnum } from '@novu/application-generic';
import { ExpandEmailEditorSchemaCommand } from './expand-email-editor-schema-command';
import { HydrateEmailSchemaUseCase } from './hydrate-email-schema.usecase';
import { parseLiquid } from './email-output-renderer.usecase';
import { FullPayloadForRender } from './render-command';

@Injectable()
export class ExpandEmailEditorSchemaUsecase {
  constructor(private hydrateEmailSchemaUseCase: HydrateEmailSchemaUseCase) {}

  async execute(command: ExpandEmailEditorSchemaCommand): Promise<TipTapNode> {
    const hydratedEmailSchema = this.hydrateEmailSchemaUseCase.execute({
      emailEditor: command.emailEditorJson,
    });

    const processed = await this.processSpecialNodeTypes(command.fullPayloadForRender, hydratedEmailSchema);

    // needs to be done after the special node types are processed
    this.processVariableNodeTypes(processed, command.fullPayloadForRender);

    return processed;
  }

  private async processSpecialNodeTypes(variables: FullPayloadForRender, rootNode: TipTapNode): Promise<TipTapNode> {
    const processedNode = structuredClone(rootNode);
    await this.traverseAndProcessNodes(processedNode, variables);

    return processedNode;
  }

  private async traverseAndProcessNodes(
    node: TipTapNode,
    variables: FullPayloadForRender,
    parent?: TipTapNode
  ): Promise<void> {
    const queue: Array<{ node: TipTapNode; parent?: TipTapNode }> = [{ node, parent }];

    while (queue.length > 0) {
      const current = queue.shift()!;
      await this.processNode(current.node, variables, current.parent);

      if (current.node.content) {
        for (const childNode of current.node.content) {
          queue.push({ node: childNode, parent: current.node });
        }
      }
    }
  }

  private async processNode(node: TipTapNode, variables: FullPayloadForRender, parent?: TipTapNode): Promise<void> {
    if (this.hasShow(node)) {
      await this.handleShowNode(node, variables, parent);
    }

    if (this.hasEach(node)) {
      await this.handleEachNode(node, variables, parent);
    }
  }

  private async handleShowNode(
    node: TipTapNode & { attrs: { [MailyAttrsEnum.SHOW_IF_KEY]: string } },
    variables: FullPayloadForRender,
    parent?: TipTapNode
  ): Promise<void> {
    const shouldShow = await this.evaluateShowCondition(variables, node);
    if (!shouldShow && parent?.content) {
      parent.content = parent.content.filter((pNode) => pNode !== node);

      return;
    }

    // @ts-ignore
    delete node.attrs[MailyAttrsEnum.SHOW_IF_KEY];
  }

  private async handleEachNode(
    node: TipTapNode & { attrs: { [MailyAttrsEnum.EACH_KEY]: string } },
    variables: FullPayloadForRender,
    parent?: TipTapNode
  ): Promise<void> {
    const newContent = await this.multiplyForEachNode(node, variables);
    if (parent?.content) {
      const nodeIndex = parent.content.indexOf(node);
      parent.content = [...parent.content.slice(0, nodeIndex), ...newContent, ...parent.content.slice(nodeIndex + 1)];
    } else {
      node.content = newContent;
    }
  }

  private async evaluateShowCondition(
    variables: FullPayloadForRender,
    node: TipTapNode & { attrs: { [MailyAttrsEnum.SHOW_IF_KEY]: string } }
  ): Promise<boolean> {
    const { [MailyAttrsEnum.SHOW_IF_KEY]: showIfKey } = node.attrs;
    const parsedShowIfValue = await parseLiquid(showIfKey, variables);

    return this.stringToBoolean(parsedShowIfValue);
  }

  private processVariableNodeTypes(node: TipTapNode, variables: FullPayloadForRender) {
    if (this.isAVariableNode(node)) {
      node.type = 'text'; // set 'variable' to 'text' to for Liquid to recognize it
    }

    node.content?.forEach((innerNode) => this.processVariableNodeTypes(innerNode, variables));
  }

  private hasEach(node: TipTapNode): node is TipTapNode & { attrs: { [MailyAttrsEnum.EACH_KEY]: string } } {
    return node.attrs?.[MailyAttrsEnum.EACH_KEY] !== undefined && node.attrs?.[MailyAttrsEnum.EACH_KEY] !== null;
  }

  private hasShow(node: TipTapNode): node is TipTapNode & { attrs: { [MailyAttrsEnum.SHOW_IF_KEY]: string } } {
    return node.attrs?.[MailyAttrsEnum.SHOW_IF_KEY] !== undefined && node.attrs?.[MailyAttrsEnum.SHOW_IF_KEY] !== null;
  }

  private isOrderedList(templateContent: TipTapNode[]) {
    return templateContent.length === 1 && templateContent[0].type === 'orderedList';
  }

  private isBulletList(templateContent: TipTapNode[]) {
    return templateContent.length === 1 && templateContent[0].type === 'bulletList';
  }

  /**
   * For 'each' node, multiply the content by the number of items in the iterable array
   * and add indexes to the placeholders.
   *
   * @example
   * node:
   * {
   *   type: 'each',
   *   attrs: { each: '{{ payload.comments }}' },
   *   content: [
   *     { type: 'variable', text: '{{ payload.comments[0].author }}' }
   *   ]
   * }
   *
   * variables:
   * { payload: { comments: [{ author: 'John Doe' }, { author: 'Jane Doe' }] } }
   *
   * result:
   * [
   *   { type: 'text', text: '{{ payload.comments[0].author }}' },
   *   { type: 'text', text: '{{ payload.comments[1].author }}' }
   * ]
   *
   */
  private async multiplyForEachNode(
    node: TipTapNode & { attrs: { [MailyAttrsEnum.EACH_KEY]: string } },
    variables: FullPayloadForRender
  ): Promise<TipTapNode[]> {
    const iterablePath = node.attrs[MailyAttrsEnum.EACH_KEY];
    const nodeContent = node.content || [];
    const expandedContent: TipTapNode[] = [];

    const iterableArrayString = await parseLiquid(iterablePath, variables);

    let iterableArray: unknown;
    try {
      iterableArray = JSON.parse(iterableArrayString.replace(/'/g, '"'));
    } catch (error) {
      throw new Error(`Failed to parse iterable value for "${iterablePath}": ${error.message}`);
    }

    if (!Array.isArray(iterableArray)) {
      throw new Error(`Iterable "${iterablePath}" is not an array`);
    }

    for (const [index] of iterableArray.entries()) {
      const contentToExpand =
        (this.isOrderedList(nodeContent) || this.isBulletList(nodeContent)) && nodeContent[0].content
          ? nodeContent[0].content
          : nodeContent;

      const hydratedContent = this.addIndexesToPlaceholders(contentToExpand, iterablePath, index);
      expandedContent.push(...hydratedContent);
    }

    return expandedContent;
  }

  private addIndexesToPlaceholders(nodes: TipTapNode[], iterablePath: string, index: number): TipTapNode[] {
    return nodes.map((node) => {
      const newNode: TipTapNode = { ...node };

      if (this.isAVariableNode(newNode)) {
        const nodePlaceholder = newNode.text as string;

        newNode.text = nodePlaceholder.replace(MAILY_ITERABLE_MARK, index.toString());
        newNode.type = 'text'; // set 'variable' to 'text' to for Liquid to recognize it
      } else if (newNode.content) {
        newNode.content = this.addIndexesToPlaceholders(newNode.content, iterablePath, index);
      }

      return newNode;
    });
  }

  private stringToBoolean(value: unknown): boolean {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }

    return false;
  }

  private isAVariableNode(newNode: TipTapNode): newNode is TipTapNode & { attrs: { [MailyAttrsEnum.ID]: string } } {
    return newNode.type === 'variable';
  }
}
