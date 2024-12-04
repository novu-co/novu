import { Template, Liquid } from 'liquidjs';

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

  const liquidExpressions = extractLiquidExpressions(str);
  if (liquidExpressions.length === 0) {
    return { validVariables: [], invalidVariables: [] };
  }

  let variables = new Set<string>();
  const invalidVariables: { context: string; message: string; variable: string }[] = [];

  for (const liquidExpression of liquidExpressions) {
    try {
      variables = new Set([...variables, ...parseByLiquid(liquidExpression)]);
    } catch (error) {
      invalidVariables.push(
        ...error.errors.map((e) => ({ context: e.context, message: e.message, variable: liquidExpression }))
      );
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

/**
 * Extracts all Liquid expressions wrapped in {{ }} from a given string
 * @example
 * "{{ username | append: 'hi' }}" => ["{{ username | append: 'hi' }}"]
 * "<input value='{{username}}'>" => ["{{username}}"]
 */
export function extractLiquidExpressions(str: string): string[] {
  if (!str) return [];

  const liquidExpressionPattern = /{{\s*[^{}]+}}/g;

  return str.match(liquidExpressionPattern) || [];
}
