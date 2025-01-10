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

    const processed = await this.processSpecialNodeTypes(
      command.fullPayloadForRender as unknown as Record<string, unknown>,
      emailSchemaHydrated
    );

    // needs to be done after the special node types are processed
    this.processVariableNodeTypes(processed, command.fullPayloadForRender as unknown as Record<string, unknown>);

    return processed;
  }

  private hydrate(command: ExpandEmailEditorSchemaCommand) {
    const { hydratedEmailSchema } = this.hydrateEmailSchemaUseCase.execute({
      emailEditor: command.emailEditorJson,
      fullPayloadForRender: command.fullPayloadForRender,
    });

    return hydratedEmailSchema;
  }

  private async processSpecialNodeTypes(variables: Record<string, unknown>, rootNode: TipTapNode): Promise<TipTapNode> {
    const processedNode = structuredClone(rootNode);
    await this.traverseAndProcessNodes(processedNode, variables);

    return processedNode;
  }

  private async traverseAndProcessNodes(
    node: TipTapNode,
    variables: Record<string, unknown>,
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

  private async processNode(node: TipTapNode, variables: Record<string, unknown>, parent?: TipTapNode): Promise<void> {
    if (this.hasShow(node)) {
      await this.handleShowNode(node, variables, parent);
    }

    if (this.hasEach(node)) {
      await this.handleEachNode(node, variables, parent);
    }
  }

  private async handleShowNode(
    node: TipTapNode & { attrs: { showIfKey: unknown } },
    variables: Record<string, unknown>,
    parent?: TipTapNode
  ): Promise<void> {
    const shouldShow = await this.evaluateShowCondition(variables, node);
    if (!shouldShow && parent?.content) {
      parent.content = parent.content.filter((pNode) => pNode !== node);

      return;
    }
    if (node.attrs) {
      delete node.attrs[MailyAttrsEnum.SHOW_IF_KEY];
    }
  }

  private async handleEachNode(
    node: TipTapNode & { attrs: { each: unknown } },
    variables: Record<string, unknown>,
    parent?: TipTapNode
  ): Promise<void> {
    const newContent = this.multiplyForEachNode(node, variables);
    if (parent?.content) {
      const nodeIndex = parent.content.indexOf(node);
      parent.content = [...parent.content.slice(0, nodeIndex), ...newContent, ...parent.content.slice(nodeIndex + 1)];
    } else {
      node.content = newContent;
    }
  }

  private async evaluateShowCondition(
    variables: Record<string, unknown>,
    node: TipTapNode & { attrs: { [MailyAttrsEnum.SHOW_IF_KEY]: unknown } }
  ): Promise<boolean> {
    const { [MailyAttrsEnum.SHOW_IF_KEY]: showIfKey } = node.attrs;
    if (showIfKey === undefined) return true;

    const parsedShowIfValue = await parseLiquid(showIfKey as string, variables);

    return typeof parsedShowIfValue === 'boolean' ? parsedShowIfValue : this.stringToBoolean(parsedShowIfValue);
  }

  private processVariableNodeTypes(node: TipTapNode, variables: Record<string, unknown>) {
    if (this.isAVariableNode(node)) {
      node.type = 'text'; // set 'variable' to 'text' to for Liquid to recognize it
    }

    node.content?.forEach((innerNode) => this.processVariableNodeTypes(innerNode, variables));
  }

  private hasEach(node: TipTapNode): node is TipTapNode & { attrs: { each: unknown } } {
    return !!(node.attrs && 'each' in node.attrs);
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
   *   attrs: { each: 'payload.comments' },
   *   content: [
   *     { type: 'variable', text: '{{ payload.comments.author }}' }
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
  private multiplyForEachNode(
    node: TipTapNode & { attrs: { each: unknown } },
    variables: Record<string, unknown>
  ): TipTapNode[] {
    const iterablePath = node.attrs.each as string;
    const nodeContent = node.content || [];
    const expandedContent: TipTapNode[] = [];

    const iterableArray = this.getValueByPath(variables, iterablePath) as [{ [key: string]: unknown }];

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

        /**
         * example:
         * iterablePath = payload.comments
         * nodePlaceholder = {{ payload.comments.author }}
         * text = {{ payload.comments[0].author }}
         */
        newNode.text = nodePlaceholder.replace(iterablePath, `${iterablePath}[${index}]`);
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

  private isAVariableNode(newNode: TipTapNode): newNode is TipTapNode & { attrs: { id: string } } {
    return newNode.type === 'variable';
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
