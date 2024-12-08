import { Template, Liquid, RenderError, LiquidError } from 'liquidjs';
import { isValidTemplate, extractLiquidExpressions } from './parser-utils';

const LIQUID_CONFIG = {
  strictVariables: true,
  strictFilters: true,
  greedy: false,
  catchAllErrors: true,
} as const;

export type Variable = {
  context?: string;
  message?: string;
  name: string;
};

export type TemplateParseResult = {
  validVariables: Variable[];
  invalidVariables: Variable[];
};

/**
 * Copy of LiquidErrors type from liquidjs since it's not exported.
 * Used to handle multiple render errors that can occur during template parsing.
 * @see https://github.com/harttle/liquidjs/blob/d61855bf725a6deba203201357f7455f6f9b4a32/src/util/error.ts#L65
 */
class LiquidErrors extends LiquidError {
  errors: RenderError[];
}

function isLiquidErrors(error: unknown): error is LiquidErrors {
  return error instanceof LiquidError && 'errors' in error && Array.isArray((error as LiquidErrors).errors);
}

/**
 * Parses a Liquid template string and extracts all variable names, including nested paths.
 * Validates the syntax and separates valid variables from invalid ones.
 *
 * @example
 * // Valid variables
 * parseLiquidVariables('Hello {{user.name}}, your score is {{user.score}}')
 * // Returns:
 * {
 *   validVariables: ['user.name', 'user.score'],
 *   invalidVariables: []
 * }
 *
 * @example
 * // Mixed valid and invalid syntax
 * parseLiquidVariables('{{user.name}} {{invalid..syntax}}')
 * // Returns:
 * {
 *   validVariables: ['user.name'],
 *   invalidVariables: [{
 *     context: '>> 1| {{invalid..syntax}}\n                ^',
 *     message: 'expected "|" before filter',
 *     variable: '{{invalid..syntax}}'
 *   }]
 * }
 *
 * @param template - The Liquid template string to parse
 * @returns Object containing arrays of valid and invalid variables found in the template
 */
export function extractLiquidTemplateVariables(template: string): TemplateParseResult {
  if (!isValidTemplate(template)) {
    return { validVariables: [], invalidVariables: [] };
  }

  const liquidRawOutput = extractLiquidExpressions(template);
  if (liquidRawOutput.length === 0) {
    return { validVariables: [], invalidVariables: [] };
  }

  return processLiquidRawOutput(liquidRawOutput);
}

function processLiquidRawOutput(rawOutputs: string[]): TemplateParseResult {
  const validVariables = new Set<string>();
  const invalidVariables: Variable[] = [];

  for (const rawOutput of rawOutputs) {
    try {
      const parsedVars = parseByLiquid(rawOutput);
      parsedVars.forEach((variable) => validVariables.add(variable));
    } catch (error: unknown) {
      if (isLiquidErrors(error)) {
        invalidVariables.push(
          ...error.errors.map((e: RenderError) => ({
            context: e.context,
            message: e.message,
            name: rawOutput,
          }))
        );
      }
    }
  }

  return {
    validVariables: [...validVariables].map((name) => ({ name })),
    invalidVariables,
  };
}

function parseByLiquid(expression: string): Set<string> {
  const variables = new Set<string>();
  const engine = new Liquid(LIQUID_CONFIG);
  const parsed = engine.parse(expression) as unknown as Template[];

  parsed.forEach((template: Template) => {
    if (isOutputToken(template)) {
      const props = extractValidProps(template);
      if (props.length > 0) {
        variables.add(props.join('.'));
      }
    }
  });

  return variables;
}

function isOutputToken(template: Template): boolean {
  return template.token?.constructor.name === 'OutputToken';
}

function extractValidProps(template: any): string[] {
  const initial = template.value?.initial;
  if (!initial?.postfix?.[0]?.props) return [];

  const validProps: string[] = [];
  for (const prop of initial.postfix[0].props) {
    if (prop.constructor.name !== 'IdentifierToken') break;
    validProps.push(prop.content);
  }

  return validProps;
}
