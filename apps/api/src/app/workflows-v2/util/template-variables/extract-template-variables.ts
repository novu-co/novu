import { Template, Liquid } from 'liquidjs';

/**
 * Matches Liquid template variables wrapped in double curly braces, including filters
 * @example
 * Basic variables:
 * "{{username}}" => ["username"]
 * "{{ username }}" => ["username"]
 *
 * With filters:
 * "{{username | append: ', hi!'}}" => ["username"]
 * "{{user.name | capitalize | append: '!'}}" => ["user.name"]
 *
 * Multiple variables:
 * "Hello {{user.name}} and {{order.id | append: '-x'}}" => ["user.name", "order.id"]
 */
const LIQUID_VARIABLE_PATTERN = /{{\s*([^}\s|]+)(?:\s*\|[^}]*)?}}/g;

/**
 * Validates if string is a proper dot-notation variable path
 * @example
 * "user.name" => true
 * "order.items.0.id" => true
 * ".invalid" => false
 * "user..name" => false
 */
const VALID_VARIABLE_PATH_PATTERN = /^[\w]+(\.[\w]+)*$/;

/**
 * Extracts variable names from a Liquid template string using both parsing and regex approaches
 * to be more permissive with invalid syntax while still capturing valid variables.
 */
export const extractTemplateVars = function (str: string): {
  validVariables: string[];
  invalidVariables: { context: string; message: string; variable: string }[];
} {
  if (str === null || str === undefined || str === '' || typeof str !== 'string') {
    return { validVariables: [], invalidVariables: [] };
  }

  let variables = new Set<string>();
  const invalidVariables: { context: string; message: string; variable: string }[] = [];

  try {
    variables = parseByLiquid(str);
  } catch (error) {
    invalidVariables.push(
      ...error.errors.map((e) => ({ context: e.context, message: e.message, variable: e.variable || 'unknown' }))
    );
    try {
      variables = parseByRegex(str);
    } catch (e) {
      return { validVariables: [], invalidVariables: e };
    }
  }

  return { validVariables: Array.from(variables), invalidVariables };
};
function parseByLiquid(str: string): Set<string> {
  const variables = new Set<string>();

  const engine = new Liquid({
    strictVariables: true,
    strictFilters: true,
    greedy: false,
    catchAllErrors: true,
  });

  const parsed = engine.parse(str) as Template[] as any;

  for (const template of parsed) {
    if (template.token.constructor.name === 'OutputToken') {
      const initial = template.value?.initial;
      if (!initial?.postfix?.length) continue;

      const validProps: string[] = [];
      for (const prop of initial.postfix[0].props) {
        if (prop.constructor.name !== 'IdentifierToken') break;
        validProps.push(prop.content);
      }

      if (validProps.length > 0) {
        variables.add(validProps.join('.'));
      }
    }
  }

  return variables;
}

function parseByRegex(str: string): Set<string> {
  const variables = new Set<string>();

  const matches = str.match(LIQUID_VARIABLE_PATTERN) || [];

  for (const match of matches) {
    const normalizedVariable = match
      .replace(/{{/g, '')
      .replace(/}}/g, '')
      .trim()
      .split('|')[0] // Remove any liquid filters
      .trim();

    if (VALID_VARIABLE_PATH_PATTERN.test(normalizedVariable)) {
      variables.add(normalizedVariable);
    }
  }

  return variables;
}
