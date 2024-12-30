import { useMemo } from 'react';
import { TransformerWithParam } from '../types';
import { TRANSFORMERS } from '../constants';

export function useVariableParser(variable: string) {
  return useMemo(() => {
    if (!variable) {
      return { parsedName: '', parsedDefaultValue: '', parsedTransformers: [] };
    }

    const parts = variable.split('|').map((part) => part.trim());
    const [nameWithDefault, ...restParts] = parts;

    // Handle default value - check both in nameWithDefault and rest parts
    let name = nameWithDefault || '';
    let defaultVal = '';

    // Function to extract default value from a part
    const extractDefault = (part: string) => {
      const defaultMatch =
        part.match(/default:\s*'((?:[^'\\]|\\.)*)'/) ||
        part.match(/default:\s*"((?:[^"\\]|\\.)*)"/) ||
        part.match(/default:\s*([^}\s]+)/);

      if (defaultMatch) {
        defaultVal = defaultMatch[1].replace(/\\\\'/g, "\\'").replace(/\\'/g, "'");
        return true;
      }
      return false;
    };

    // First check if default is in the nameWithDefault part
    if (nameWithDefault?.includes('default:')) {
      name = nameWithDefault.replace(/\s*\|\s*default:[^}]+/, '').trim();
      extractDefault(nameWithDefault);
    }

    // Also check rest parts for default value and filter out default parts
    const transformerParts = restParts.filter((part) => {
      if (part.startsWith('default:')) {
        extractDefault(part);
        return false;
      }
      return true;
    });

    // Get all transformers with their parameters
    const transforms =
      transformerParts.reduce<TransformerWithParam[]>((acc, part) => {
        const [transformerValue, ...paramValues] = part.split(':').map((p) => p.trim());
        if (TRANSFORMERS.some((t) => t.value === transformerValue)) {
          // Parse parameters, handling quoted values and commas
          const params =
            paramValues.length > 0
              ? paramValues
                  .join(':')
                  .split(',')
                  .map((param) => param.trim().replace(/^['"]|["']$/g, ''))
              : undefined;

          acc.push({ value: transformerValue, ...(params ? { params } : {}) });
        }
        return acc;
      }, []) || [];

    return {
      parsedName: name,
      parsedDefaultValue: defaultVal,
      parsedTransformers: transforms,
    };
  }, [variable]);
}
