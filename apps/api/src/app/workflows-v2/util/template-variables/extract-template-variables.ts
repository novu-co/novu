import { Template, Liquid, RenderError, LiquidError } from 'liquidjs';

type InvalidVariable = {
  context: string;
  message: string;
  variable: string;
};

type TemplateParseResult = {
  validVariables: string[];
  invalidVariables: InvalidVariable[];
};

const LIQUID_CONFIG = {
  strictVariables: true,
  strictFilters: true,
  greedy: false,
  catchAllErrors: true,
} as const;

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

export function extractTemplateVars(template: string): TemplateParseResult {
  if (!isValidTemplate(template)) {
    return { validVariables: [], invalidVariables: [] };
  }

  const liquidRawOutput = extractLiquidExpressions(template);
  if (liquidRawOutput.length === 0) {
    return { validVariables: [], invalidVariables: [] };
  }

  return processLiquidRawOutput(liquidRawOutput);
}

function isValidTemplate(template: unknown): template is string {
  return typeof template === 'string' && template.length > 0;
}

function processLiquidRawOutput(rawOutputs: string[]): TemplateParseResult {
  const variables = new Set<string>();
  const invalidVariables: InvalidVariable[] = [];

  for (const rawOutput of rawOutputs) {
    try {
      const parsedVars = parseByLiquid(rawOutput);
      parsedVars.forEach((variable) => variables.add(variable));
    } catch (error: unknown) {
      if (isLiquidErrors(error)) {
        invalidVariables.push(
          ...error.errors.map((e: RenderError) => ({
            context: e.context,
            message: e.message,
            variable: rawOutput,
          }))
        );
      }
    }
  }

  return {
    validVariables: Array.from(variables),
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

/**
 * Extracts all Liquid expressions wrapped in {{ }} from a given string
 * @example
 * "{{ username | append: 'hi' }}" => ["{{ username | append: 'hi' }}"]
 * "<input value='{{username}}'>" => ["{{username}}"]
 */
export function extractLiquidExpressions(str: string): string[] {
  if (!str) return [];

  const LIQUID_EXPRESSION_PATTERN = /{{\s*[^{}]+}}/g;

  return str.match(LIQUID_EXPRESSION_PATTERN) || [];
}
