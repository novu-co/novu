import { Liquid } from 'liquidjs';

/**
 * Extracts variable names from a Liquid template string by parsing and traversing the tokens.
 * Returns a Set of dot-notation variable paths found in the template.
 *
 * @param str - The Liquid template string to parse
 * @returns Array of variable paths found in the template
 * @example
 * const template = "Hello {{user.name}}, your order #{{order.id}} is {{order.status}}";
 * extractTemplateVars(template)
 * // Returns Array [ "user.name", "order.id", "order.status" ]
 */
export const extractTemplateVars = function (str: string): string[] {
  if (str === null || str === undefined || typeof str !== 'string') {
    return [];
  }

  const variables = new Set<string>();
  const engine = new Liquid();
  const parsed = engine.parse(str);

  function traverseTokens(templates) {
    for (const template of templates) {
      if (template.token.constructor.name === 'OutputToken') {
        for (const postfix of template.value?.initial?.postfix || []) {
          const prop = postfix.props[0];
          if (prop.constructor.name === 'IdentifierToken') {
            variables.add(postfix.props.map((propX) => propX.content).join('.'));
          }
        }
      }
    }
  }

  traverseTokens(parsed);

  return Array.from(variables);
};
