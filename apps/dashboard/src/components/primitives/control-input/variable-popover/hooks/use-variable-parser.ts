import { Tokenizer, TokenKind } from 'liquidjs';
import { useMemo } from 'react';
import { FILTERS } from '../constants';
import { FilterWithParam } from '../types';

export function useVariableParser(variable: string): {
  parsedName: string;
  parsedDefaultValue: string;
  parsedFilters: FilterWithParam[];
  originalVariable: string;
} {
  return useMemo(() => {
    if (!variable) {
      return { parsedName: '', parsedDefaultValue: '', parsedFilters: [], originalVariable: '' };
    }

    try {
      // Remove {{ and }} and trim
      const cleanVariable = variable.replace(/^\{\{|\}\}$/g, '').trim();

      // The content before any filters is the variable name
      const [variableName, ...filterParts] = cleanVariable.split('|');
      const parsedName = variableName.trim();

      let parsedDefaultValue = '';
      const parsedFilters: FilterWithParam[] = [];

      if (filterParts.length > 0) {
        const filterTokenizer = new Tokenizer('|' + filterParts.join('|'));
        const filters = filterTokenizer.readFilters();

        // First pass: find default value
        for (const filter of filters) {
          if (filter.kind === TokenKind.Filter && filter.name === 'default' && filter.args.length > 0) {
            parsedDefaultValue = (filter.args[0] as any).content;
            break;
          }
        }

        // Second pass: collect other filters
        for (const filter of filters) {
          if (
            filter.kind === TokenKind.Filter &&
            filter.name !== 'default' &&
            FILTERS.some((t) => t.value === filter.name)
          ) {
            parsedFilters.push({
              value: filter.name,
              ...(filter.args.length > 0
                ? {
                    params: filter.args.map((arg) => {
                      return (arg as any).content;
                    }),
                  }
                : {}),
            });
          }
        }
      }

      return {
        parsedName,
        parsedDefaultValue,
        parsedFilters,
        originalVariable: variable,
      };
    } catch (error) {
      console.error('Error parsing variable:', error);
      return { parsedName: '', parsedDefaultValue: '', parsedFilters: [], originalVariable: variable };
    }
  }, [variable]);
}
