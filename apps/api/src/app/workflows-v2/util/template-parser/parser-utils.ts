/**
 * Validates if the provided template is a non-empty string
 */
export function isValidTemplate(template: unknown): template is string {
  return typeof template === 'string' && template.length > 0;
}

/**
 * Extracts all Liquid expressions wrapped in {{ }} from a given string
 * @example
 * "{{ username | append: 'hi' }}" => ["{{ username | append: 'hi' }}"]
 * "<input value='{{username}}'>" => ["{{username}}"]
 */
export function extractLiquidExpressions(str: string): string[] {
  if (!str) return [];

  const LIQUID_EXPRESSION_PATTERN = /{{\s*[^{}]*}}/g;

  return str.match(LIQUID_EXPRESSION_PATTERN) || [];
}
