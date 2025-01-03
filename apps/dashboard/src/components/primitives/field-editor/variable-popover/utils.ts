import { TRANSFORMERS } from './constants';

function escapeString(str: string): string {
  return str.replace(/'/g, "\\'");
}

export function formatParamValue(param: string, type?: 'string' | 'number') {
  if (type === 'number') {
    return param;
  }
  return `'${escapeString(param)}'`;
}

export function formatLiquidVariable(
  name: string,
  defaultValue: string,
  transformers: { value: string; params?: string[] }[]
) {
  const parts = [name.trim()];

  if (defaultValue) {
    parts.push(`default: '${escapeString(defaultValue.trim())}'`);
  }

  transformers.forEach((t) => {
    if (t.value === 'default') return;

    if (!t.params?.length) {
      parts.push(t.value);
    } else {
      const transformerDef = TRANSFORMERS.find((def) => def.value === t.value);
      const formattedParams = t.params.map((param, index) =>
        formatParamValue(param, transformerDef?.params?.[index]?.type)
      );

      parts.push(`${t.value}: ${formattedParams.join(', ')}`);
    }
  });

  return `{{${parts.join(' | ')}}}`;
}
