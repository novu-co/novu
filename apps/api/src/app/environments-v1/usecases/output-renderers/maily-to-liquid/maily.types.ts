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

export const MAILY_ITERABLE_MARK = '0';

export const MAILY_FIRST_CITIZEN_VARIABLE_KEY = [
  MailyAttrsEnum.ID,
  MailyAttrsEnum.SHOW_IF_KEY,
  MailyAttrsEnum.EACH_KEY,
];
