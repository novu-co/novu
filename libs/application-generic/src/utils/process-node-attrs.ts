import { JSONContent } from '@maily-to/render';

export enum MailyContentTypeEnum {
  VARIABLE = 'variable',
  FOR = 'for',
  BUTTON = 'button',
  IMAGE = 'image',
  LINK = 'link',
}

export const variableAttributeConfig = (type: MailyContentTypeEnum) => {
  // todo add variable type
  if (type === MailyContentTypeEnum.BUTTON) {
    return [
      { attr: 'text', flag: 'isTextVariable' },
      { attr: 'url', flag: 'isUrlVariable' },
      { attr: 'showIfKey', flag: 'showIfKey' },
    ];
  }

  if (type === MailyContentTypeEnum.IMAGE) {
    return [
      { attr: 'src', flag: 'isSrcVariable' },
      { attr: 'externalLink', flag: 'isExternalLinkVariable' },
      { attr: 'showIfKey', flag: 'showIfKey' },
    ];
  }

  if (type === MailyContentTypeEnum.LINK) {
    return [{ attr: 'href', flag: 'isUrlVariable' }];
  }

  return [{ attr: 'showIfKey', flag: 'showIfKey' }];
};

function processAttributes(
  attrs: Record<string, unknown>,
  type: MailyContentTypeEnum,
): void {
  if (!attrs) return;

  const typeConfig = variableAttributeConfig(type);

  for (const { attr, flag } of typeConfig) {
    if (attrs[flag] && attrs[attr]) {
      // eslint-disable-next-line no-param-reassign
      attrs[attr] = wrapInLiquidOutput(attrs[attr] as string);
    }
  }
}

export function processNodeAttrs(node: JSONContent): JSONContent {
  if (!node.attrs) return node;

  processAttributes(node.attrs, node.type as MailyContentTypeEnum);

  return node;
}

export function processNodeMarks(node: JSONContent): JSONContent {
  if (!node.marks) return node;

  for (const mark of node.marks) {
    if (mark.attrs) {
      processAttributes(mark.attrs, mark.type as MailyContentTypeEnum);
    }
  }

  return node;
}

export function wrapInLiquidOutput(value: string): string {
  return `{{${value}}}`;
}
