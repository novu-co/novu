import { JSONContent } from '@maily-to/render';

export enum MailyContentTypeEnum {
  VARIABLE = 'variable',
  FOR = 'for',
  BUTTON = 'button',
  IMAGE = 'image',
  LINK = 'link',
}

export enum MailyAttrsEnum {
  ID = 'id',
  SHOW_IF_KEY = 'showIfKey',
}

export const variableAttributeConfig = (type: MailyContentTypeEnum) => {
  const commonConfig = [
    /*
     * Maily Variable Map
     * * maily_id equals to maily_variable
     * * https://github.com/arikchakma/maily.to/blob/ebcf233eb1d4b16fb568fb702bf0756678db38d0/packages/render/src/maily.tsx#L787
     */
    { attr: 'id', flag: 'id' },
    /*
     * showIfKey is always a maily_variable
     */
    { attr: 'showIfKey', flag: 'showIfKey' },
  ];

  if (type === MailyContentTypeEnum.BUTTON) {
    return [
      { attr: 'text', flag: 'isTextVariable' },
      { attr: 'url', flag: 'isUrlVariable' },
      ...commonConfig,
    ];
  }

  if (type === MailyContentTypeEnum.IMAGE) {
    return [
      { attr: 'src', flag: 'isSrcVariable' },
      { attr: 'externalLink', flag: 'isExternalLinkVariable' },
      ...commonConfig,
    ];
  }

  if (type === MailyContentTypeEnum.LINK) {
    return [{ attr: 'href', flag: 'isUrlVariable' }, ...commonConfig];
  }

  return commonConfig;
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
      attrs[attr] = wrapInLiquidOutput(
        attrs[attr] as string,
        attrs.fallback as string,
      );
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

const wrapInLiquidOutput = (variableName: string, fallback?: string) =>
  `{{ ${variableName}${fallback ? ` | default: '${fallback}'` : ''} }}`;
