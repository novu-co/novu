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
  EACH_KEY = 'each',
  FALLBACK = 'fallback',
  IS_SRC_VARIABLE = 'isSrcVariable',
  IS_EXTERNAL_LINK_VARIABLE = 'isExternalLinkVariable',
  IS_TEXT_VARIABLE = 'isTextVariable',
  IS_URL_VARIABLE = 'isUrlVariable',
  TEXT = 'text',
  URL = 'url',
  SRC = 'src',
  EXTERNAL_LINK = 'externalLink',
  HREF = 'href',
}

const MAILY_FIRST_CITIZEN_VARIABLE_KEY = [
  MailyAttrsEnum.ID,
  MailyAttrsEnum.SHOW_IF_KEY,
];

export const variableAttributeConfig = (type: MailyContentTypeEnum) => {
  const commonConfig = [
    /*
     * Maily Variable Map
     * * maily_id equals to maily_variable
     * * https://github.com/arikchakma/maily.to/blob/ebcf233eb1d4b16fb568fb702bf0756678db38d0/packages/render/src/maily.tsx#L787
     */
    { attr: MailyAttrsEnum.ID, flag: MailyAttrsEnum.ID },
    /*
     * showIfKey is always a maily_variable
     */
    { attr: MailyAttrsEnum.SHOW_IF_KEY, flag: MailyAttrsEnum.SHOW_IF_KEY },
  ];

  if (type === MailyContentTypeEnum.BUTTON) {
    return [
      { attr: MailyAttrsEnum.TEXT, flag: MailyAttrsEnum.IS_TEXT_VARIABLE },
      { attr: MailyAttrsEnum.URL, flag: MailyAttrsEnum.IS_URL_VARIABLE },
      ...commonConfig,
    ];
  }

  if (type === MailyContentTypeEnum.IMAGE) {
    return [
      { attr: MailyAttrsEnum.SRC, flag: MailyAttrsEnum.IS_SRC_VARIABLE },
      {
        attr: MailyAttrsEnum.EXTERNAL_LINK,
        flag: MailyAttrsEnum.IS_EXTERNAL_LINK_VARIABLE,
      },
      ...commonConfig,
    ];
  }

  if (type === MailyContentTypeEnum.LINK) {
    return [
      { attr: MailyAttrsEnum.HREF, flag: MailyAttrsEnum.IS_URL_VARIABLE },
      ...commonConfig,
    ];
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
      if (!MAILY_FIRST_CITIZEN_VARIABLE_KEY.includes(flag)) {
        // eslint-disable-next-line no-param-reassign
        attrs[flag] = false;
      }
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
