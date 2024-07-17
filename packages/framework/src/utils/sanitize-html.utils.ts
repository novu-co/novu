import sanitizeTypes, { IOptions } from 'sanitize-html';

/**
 * Options for the sanitize-html library.
 *
 * @see https://www.npmjs.com/package/sanitize-html#default-options
 */
const sanitizeOptions: IOptions = {
  /**
   * Additional tags to allow.
   */
  allowedTags: sanitizeTypes.defaults.allowedTags.concat(['style', 'img']),
  allowedAttributes: {
    ...sanitizeTypes.defaults.allowedAttributes,
    /**
     * Additional attributes to allow on all tags.
     */
    '*': ['style'],
    img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading'],
  },
  /**
   * Required to disable console warnings when allowing style tags.
   *
   * We are allowing style tags to support the use of styles in the In-App Editor.
   * This is a known security risk through an XSS attack vector,
   * but we are accepting this risk by dropping support for IE11.
   *
   * @see https://cheatsheetseries.owasp.org/cheatsheets/XSS_Filter_Evasion_Cheat_Sheet.html#remote-style-sheet
   */
  allowVulnerableTags: true,
  /**
   * Required to disable formatting of style attributes. This is useful to retain
   * formatting of style attributes in the In-App Editor.
   */
  parseStyleAttributes: false,
};

export const sanitizeHTML = (html: string) => {
  if (!html) {
    return html;
  }

  return sanitizeTypes(html, sanitizeOptions);
};

export const sanitizeHtmlInObject = (object: Record<string, any>): Record<string, any> => {
  return Object.keys(object).reduce((acc: Record<string, any>, key) => {
    const value = object[key];

    if (Array.isArray(value)) {
      acc[key] = value.map((item) => {
        if (typeof item === 'object') {
          return sanitizeHtmlInObject(item);
        }

        if (typeof item === 'string') {
          return sanitizeHTML(item);
        }

        return item;
      });

      return acc;
    }

    if (typeof value === 'object') {
      acc[key] = sanitizeHtmlInObject(value);

      return acc;
    }

    if (typeof value === 'string') {
      acc[key] = sanitizeHTML(value);

      return acc;
    }

    acc[key] = value;

    return acc;
  }, {});
};
