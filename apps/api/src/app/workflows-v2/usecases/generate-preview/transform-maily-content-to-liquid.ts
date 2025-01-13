import { JSONContent } from '@maily-to/render';
import _ from 'lodash';
import { processNodeAttrs, MailyContentTypeEnum, processNodeMarks } from '@novu/application-generic';

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

function isIterableVariable(node: JSONContent, eachVariable: string): node is IterableVariable {
  return isVariableNode(node) && Boolean(node.attrs?.id?.startsWith(eachVariable));
}

function processForLoopNode(node: JSONContent): JSONContent {
  const eachVariable = node?.attrs?.each;
  if (!eachVariable) {
    return node;
  }

  if (!Array.isArray(node.content)) {
    return node;
  }

  const processContentArray = (contentArray: JSONContent[]): JSONContent[] => {
    return contentArray.map((contentNode) => {
      // If this node has nested content, process it first
      if (contentNode.content && Array.isArray(contentNode.content)) {
        return {
          ...contentNode,
          content: processContentArray(contentNode.content),
        };
      }

      // Check if this is an iterable variable node
      if (isIterableVariable(contentNode, eachVariable)) {
        const idWithoutIterablePrefix = contentNode.attrs.id.replace(`${eachVariable}.`, '');
        const liquidId = `{{${eachVariable}[0].${idWithoutIterablePrefix}}}`;

        return {
          ...contentNode,
          attrs: {
            ...contentNode.attrs,
            id: liquidId,
          },
        };
      } else {
        return processNode(contentNode);
      }
    });
  };

  return {
    ...node,
    content: processContentArray(node.content),
  };
}

function processNode(node: JSONContent): JSONContent {
  if (!node) return node;

  let processedNode = processNodeAttrs(node);
  processedNode = processNodeMarks(processedNode);

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
