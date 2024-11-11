import { StepDataDto } from '@novu/shared';

interface LiquidVariable {
  type: 'variable';
  label: string;
  detail: string;
}

type JSONSchema = StepDataDto['variables'];

/**
 * Parse JSON Schema and extract variables for Liquid autocompletion.
 * @param schema - The JSON Schema to parse.
 * @returns An array of variable objects suitable for the Liquid language.
 */
export function parseStepVariablesToLiquidVariables(schema: JSONSchema): LiquidVariable[] {
  const variables: LiquidVariable[] = [];

  function extractProperties(obj: JSONSchema, path = ''): void {
    if (typeof obj === 'boolean') return; // Handle boolean schema

    if (obj.type === 'object' && obj.properties) {
      for (const [key, value] of Object.entries(obj.properties)) {
        const fullPath = path ? `${path}.${key}` : key;

        // Add each property as a variable for autocompletion
        variables.push({
          type: 'variable',
          label: `${fullPath}`,
          detail: typeof value !== 'boolean' ? value.description || 'JSON Schema variable' : 'JSON Schema variable',
        });

        // Recursively process nested objects
        if (typeof value === 'object' && (value.type === 'object' || value.type === 'array')) {
          extractProperties(value, fullPath);
        }
      }
    } else if (obj.type === 'array' && obj.items) {
      // For arrays, add a placeholder for array indexing
      const items = Array.isArray(obj.items) ? obj.items[0] : obj.items;
      extractProperties(items, `${path}[0]`);
    }

    // Handle combinators (allOf, anyOf, oneOf)
    ['allOf', 'anyOf', 'oneOf'].forEach((combiner) => {
      if (Array.isArray(obj[combiner as keyof typeof obj])) {
        for (const subSchema of obj[combiner as keyof typeof obj] as JSONSchema[]) {
          extractProperties(subSchema, path);
        }
      }
    });

    // Handle conditional schemas (if/then/else)
    if (obj.if) extractProperties(obj.if, path);
    if (obj.then) extractProperties(obj.then, path);
    if (obj.else) extractProperties(obj.else, path);
  }

  extractProperties(schema);
  return variables;
}
