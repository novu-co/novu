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
  const validVariables: Variable[] = [];
  const invalidVariables: Variable[] = [];

  for (const rawOutput of rawOutputs) {
    try {
      const result = parseByLiquid(rawOutput);
      validVariables.push(...result.validVariables);
      invalidVariables.push(...result.invalidVariables);
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

  return { validVariables, invalidVariables };
}

function parseByLiquid(expression: string): TemplateParseResult {
  const validVariables: Variable[] = [];
  const invalidVariables: Variable[] = [];
  const engine = new Liquid(LIQUID_CONFIG);
  const parsed = engine.parse(expression) as unknown as Template[];

  parsed.forEach((template: Template) => {
    if (isOutputToken(template)) {
      const result = extractProps(template);

      if (result.valid && result.props.length > 0) {
        const validCandidate = result.props.join('.');
        validVariables.push({ name: validCandidate });
      }

      if (!result.valid) {
        invalidVariables.push({
          name: template?.token?.input,
          message: result.error,
        });
      }
    }
  });

  return { validVariables, invalidVariables };
}

function isOutputToken(template: Template): boolean {
  return template.token?.constructor.name === 'OutputToken';
}

function extractProps(template: any): { valid: boolean; props: string[]; error?: string } {
  const initial = template.value?.initial;
  if (!initial?.postfix?.[0]?.props) return { valid: true, props: [] };

  /**
   * If initial.postfix length is greater than 1, it means the variable contains spaces
   * which is not supported in Novu's variable syntax.
   *
   * Example:
   * Valid: {{user.firstName}}
   * Invalid: {{user.first name}} - postfix length would be 2 due to space
   */
  if (initial.postfix.length > 1) {
    return { valid: false, props: [], error: 'Novu does not support variables with spaces' };
  }

  const validProps: string[] = [];

  for (const prop of initial.postfix[0].props) {
    if (prop.constructor.name !== 'IdentifierToken') break;
    validProps.push(prop.content);
  }

  /**
   * If validProps length is 1, it means the variable has no namespace which is not
   * supported in Novu's variable syntax. Variables must be namespaced.
   *
   * Example:
   * Valid: {{user.firstName}} - Has namespace 'user'
   * Invalid: {{firstName}} - No namespace
   */
  if (validProps.length === 1) {
    return { valid: false, props: [], error: 'Novu variables must include a namespace (e.g. user.firstName)' };
  }

  return { valid: true, props: validProps };
}
