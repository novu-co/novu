import { TipTapNode } from '@novu/shared';

/**
 *
 * @param value minimal tiptap object from the client is
 * {
 *  "type": "doc",
 *  "content": [
 *    {
 *      "type": "paragraph",
 *      "attrs": {
 *        "textAlign": "left"
 *      },
 *      "content": [
 *        {
 *          "type": "text",
 *          "text": " "
 *        }
 *      ]
 *  }
 *]
 *}
 */
export function isStringTipTapNode(value: unknown): value is string {
  if (typeof value !== 'string') return false;

  try {
    const parsed = JSON.parse(value);

    return isObjectTipTapNode(parsed);
  } catch {
    return false;
  }
}

export function isObjectTipTapNode(value: unknown): value is TipTapNode {
  if (!value || typeof value !== 'object') return false;

  const doc = value as TipTapNode;
  if (doc.type !== 'doc' || !Array.isArray(doc.content)) return false;

  return true;
}

function isValidTipTapContent(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false;
  const content = node as TipTapNode;
  if (typeof content.type !== 'string') return false;
  if (content.attrs !== undefined && (typeof content.attrs !== 'object' || content.attrs === null)) {
    return false;
  }
  if (content.text !== undefined && typeof content.text !== 'string') {
    return false;
  }
  if (content.content !== undefined) {
    if (!Array.isArray(content.content)) return false;

    return content.content.every((child) => isValidTipTapContent(child));
  }

  return true;
}
