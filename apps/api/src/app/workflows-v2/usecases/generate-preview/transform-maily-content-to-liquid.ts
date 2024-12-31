import { JSONContent } from '@maily-to/render';
import _ from 'lodash';
import { processNodeAttrs, MailyContentTypeEnum } from '@novu/application-generic';

/**
 * Processes raw Maily JSON editor state by converting variables to Liquid.js output syntax
 *
 * @example
 * Input:
 * {
 *   type: "variable",
 *   attrs: { id: "user.name" }
 * }
 *
 * Output:
 * {
 *   type: "variable",
 *   attrs: { id: "{{user.name}}" }
 * }
 */
export function transformMailyContentToLiquid(mailyContent: JSONContent): JSONContent {
  if (!mailyContent || typeof mailyContent !== 'object') {
    return mailyContent;
  }
  const processedState = _.cloneDeep(mailyContent);

  return processNode(processedState);
}

function processVariableNode(node: JSONContent): JSONContent {
  if (!node.attrs) {
    return node;
  }

  const attrs = node.attrs as VariableNodeContent['attrs'];
  const processedId = attrs?.id ? wrapInLiquidOutput(attrs.id) : undefined;

  return {
    ...node,
    attrs: {
      ...attrs,
      ...(processedId && { id: processedId }),
    },
  };
}

type VariableNodeContent = JSONContent & {
  type: 'variable';
  attrs?: {
    id?: string;
    [key: string]: unknown;
  };
};

type IterableVariable = JSONContent & {
  type: 'variable';
  attrs: {
    id: string;
    [key: string]: unknown;
  };
};

function isVariableNode(node: JSONContent): node is VariableNodeContent {
  return node.type === 'variable';
}

function isIterableVariable(node: JSONContent): node is IterableVariable {
  return isVariableNode(node) && Boolean(node.attrs?.id?.startsWith('iterable.'));
}

function processForLoopNode(node: JSONContent): JSONContent {
  const eachVariable = node?.attrs?.each;
  if (!eachVariable) {
    return node;
  }

  if (!Array.isArray(node.content)) {
    return node;
  }

  const content = node.content.map((contentNodeChild) => {
    if (!isIterableVariable(contentNodeChild)) {
      return processNode(contentNodeChild);
    }

    const idWithoutIterablePrefix = contentNodeChild.attrs.id.replace('iterable.', '');
    const liquidId = `{{${eachVariable}[0].${idWithoutIterablePrefix}}}`;

    return {
      ...contentNodeChild,
      attrs: {
        ...contentNodeChild.attrs,
        id: liquidId,
      },
    };
  });

  return { ...node, content };
}

function processNode(node: JSONContent): JSONContent {
  if (!node) return node;

  const processedNode = processNodeAttrs(node);

  switch (processedNode.type) {
    case MailyContentTypeEnum.VARIABLE:
      return processVariableNode(processedNode);
    case MailyContentTypeEnum.FOR:
      return processForLoopNode(processedNode);
    default:
      if (Array.isArray(processedNode.content)) {
        processedNode.content = processedNode.content.map(processNode);
      }

      return processedNode;
  }
}

function wrapInLiquidOutput(value: string): string {
  return `{{${value}}}`;
}
