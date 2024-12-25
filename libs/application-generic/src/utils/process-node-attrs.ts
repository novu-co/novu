import { JSONContent } from '@maily-to/render';

export enum MailyContentTypeEnum {
  VARIABLE = 'variable',
  FOR = 'for',
  BUTTON = 'button',
  IMAGE = 'image',
}

export const variableAttributeConfig = (type: MailyContentTypeEnum) => {
  //todo add variable type
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

  return [{ attr: 'showIfKey', flag: 'showIfKey' }];
};

export function processNodeAttrs(node: JSONContent): JSONContent {
  if (!node.attrs) return node;

  const typeConfig = variableAttributeConfig(node.type as MailyContentTypeEnum);

  for (const { attr, flag } of typeConfig) {
    if (node.attrs[flag] && node.attrs[attr]) {
      // eslint-disable-next-line no-param-reassign
      node.attrs[attr] = wrapInLiquidOutput(node.attrs[attr] as string);
    }
  }

  return node;
}

export function wrapInLiquidOutput(value: string): string {
  return `{{${value}}}`;
}
