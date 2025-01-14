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
  // early returns for invalid inputs
  if (!node?.attrs?.each || !Array.isArray(node.content)) {
    return node;
  }

  const loopVariable = node.attrs.each;

  return {
    ...node,
    content: processLoopContent(node.content, loopVariable),
  };
}

function processLoopContent(content: JSONContent[], loopVariable: string, parentLoops: string[] = []): JSONContent[] {
  return content.map((node) => {
    // handle nested for loops
    if (node.type === MailyContentTypeEnum.FOR) {
      return processForLoopNode({
        ...node,
        content: Array.isArray(node.content) ? node.content : [],
      });
    }

    // process nested content recursively until leaf nodes
    if (node.content && Array.isArray(node.content)) {
      return {
        ...node,
        content: processLoopContent(node.content, loopVariable, parentLoops),
      };
    }

    // transform variable / leaf nodes within the loop
    if (isIterableVariable(node, loopVariable)) {
      return transformLoopVariable(node, loopVariable, parentLoops);
    }

    // return unchanged node
    return node;
  });
}

function transformLoopVariable(node: IterableVariable, currentLoop: string, parentLoops: string[]): JSONContent {
  const variableId = node.attrs.id;
  const allLoopContexts = [...parentLoops, currentLoop];

  // find which loop context this variable belongs to
  const matchingLoop = allLoopContexts.find((loop) => variableId.startsWith(loop));

  if (!matchingLoop) {
    return node;
  }

  // transform the variable to use array index notation
  const variablePath = variableId.replace(`${matchingLoop}.`, '');
  const liquidVariable = `{{${matchingLoop}[0].${variablePath}}}`;

  return {
    ...node,
    attrs: {
      ...node.attrs,
      id: liquidVariable,
    },
  };
}

function processNode(node: JSONContent): JSONContent {
  if (!node) return node;

  let processedNode = processNodeAttrs(node);
  processedNode = processNodeMarks(processedNode);

  switch (processedNode.type) {
    case MailyContentTypeEnum.VARIABLE:
      return processedNode;
    case MailyContentTypeEnum.FOR:
      return processForLoopNode(processedNode);
    default:
      if (Array.isArray(processedNode.content)) {
        processedNode.content = processedNode.content.map(processNode);
      }

      return processedNode;
  }
}
