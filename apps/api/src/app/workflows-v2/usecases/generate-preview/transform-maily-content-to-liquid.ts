import { JSONContent } from '@maily-to/render';
import _ from 'lodash';

const MailyContentTypeEnum = {
  VARIABLE: 'variable',
  FOR: 'for',
  BUTTON: 'button',
  IMAGE: 'image',
} as const;

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

function processButtonNode(node: JSONContent): JSONContent {
  if (!node.attrs) return node;

  const attrs = { ...node.attrs };

  if (attrs.isTextVariable && attrs.text) {
    attrs.text = wrapInLiquidOutput(attrs.text);
  }

  if (attrs.isUrlVariable && attrs.url) {
    attrs.url = wrapInLiquidOutput(attrs.url);
  }

  return { ...node, attrs };
}

function processImageNode(node: JSONContent): JSONContent {
  if (!node.attrs) return node;

  const attrs = { ...node.attrs };

  if (attrs.isSrcVariable && attrs.src) {
    attrs.src = wrapInLiquidOutput(attrs.src);
  }

  if (attrs.isExternalLinkVariable && attrs.externalLink) {
    attrs.externalLink = wrapInLiquidOutput(attrs.externalLink);
  }

  return { ...node, attrs };
}

function processNode(node: JSONContent): JSONContent {
  if (!node) return node;

  const processedNode: JSONContent = { ...node };

  if (processedNode.attrs) {
    processedNode.attrs = processAttributes(processedNode.attrs);
  }

  switch (processedNode.type) {
    case MailyContentTypeEnum.VARIABLE:
      return processVariableNode(processedNode);
    case MailyContentTypeEnum.FOR:
      return processForLoopNode(processedNode);
    case MailyContentTypeEnum.BUTTON:
      return processButtonNode(processedNode);
    case MailyContentTypeEnum.IMAGE:
      return processImageNode(processedNode);
    default:
      if (Array.isArray(processedNode.content)) {
        processedNode.content = processedNode.content.map(processNode);
      }

      return processedNode;
  }
}

const LIQUID_WRAPPED_KEYS = ['showIfKey'] as const;
type LiquidWrappedKey = (typeof LIQUID_WRAPPED_KEYS)[number];

/**
 * Processes node attributes by converting specific keys to Liquid.js syntax
 * * Please update LIQUID_WRAPPED_KEYS if you want to wrap more attributes
 * @example
 * // Input
 * {
 *   showIfKey: "user.isActive",
 *   title: "Hello",
 *   color: "blue"
 * }
 * // Output
 * {
 *   showIfKey: "{{user.isActive}}",
 *   title: "Hello",
 *   color: "blue"
 * }
 */
export function processAttributes(content: JSONContent): Record<string, unknown> {
  if (!content.attrs) {
    return {};
  }

  return Object.entries(content.attrs).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: shouldWrapInLiquid(key) && isString(value) ? wrapInLiquidOutput(value) : value,
    }),
    {} as Record<string, unknown>
  );
}

function shouldWrapInLiquid(key: string): key is LiquidWrappedKey {
  return LIQUID_WRAPPED_KEYS.includes(key as LiquidWrappedKey);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function wrapInLiquidOutput(value: string): string {
  return `{{${value}}}`;
}
