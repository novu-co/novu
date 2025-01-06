import { useMemo } from 'react';
import { TRANSFORMERS } from '../constants';
import type { Transformer, TransformerWithParam } from '../types';

type SuggestionGroup = {
  label: string;
  transformers: Transformer[];
};

export function useSuggestedTransformers(
  variableName: string,
  currentTransformers: TransformerWithParam[]
): SuggestionGroup[] {
  return useMemo(() => {
    const currentTransformerValues = new Set(currentTransformers.map((t) => t.value));
    const suggestedTransformers: Transformer[] = [];

    const addSuggestions = (transformerValues: string[]) => {
      const newTransformers = TRANSFORMERS.filter(
        (t) => transformerValues.includes(t.value) && !currentTransformerValues.has(t.value)
      );

      suggestedTransformers.push(...newTransformers);
    };

    if (isStepsEventsPattern(variableName)) {
      addSuggestions(['digest']);
    }

    if (isDateVariable(variableName)) {
      addSuggestions(['date']);
    }

    if (isNumberVariable(variableName)) {
      addSuggestions(['round', 'floor', 'ceil', 'abs', 'plus', 'minus', 'times', 'divided_by']);
    }

    if (isArrayVariable(variableName)) {
      addSuggestions(['first', 'last', 'join', 'map', 'where', 'size']);
    }

    if (isTextVariable(variableName)) {
      addSuggestions(['upcase', 'downcase', 'capitalize', 'truncate', 'truncatewords']);
    }

    return suggestedTransformers.length > 0 ? [{ label: 'Suggested', transformers: suggestedTransformers }] : [];
  }, [variableName, currentTransformers]);
}

function isDateVariable(name: string): boolean {
  const datePatterns = ['date', 'time', 'created', 'updated', 'timestamp', 'scheduled'];

  return datePatterns.some((pattern) => name.toLowerCase().includes(pattern));
}

function isNumberVariable(name: string): boolean {
  const numberPatterns = ['count', 'amount', 'total', 'price', 'quantity', 'number', 'sum', 'age'];

  return numberPatterns.some((pattern) => name.toLowerCase().includes(pattern));
}

function isArrayVariable(name: string): boolean {
  const arrayPatterns = ['list', 'array', 'items', 'collection', 'set', 'group', 'events'];

  return arrayPatterns.some((pattern) => name.toLowerCase().includes(pattern));
}

function isTextVariable(name: string): boolean {
  const textPatterns = ['name', 'title', 'description', 'text', 'message', 'content', 'label'];

  return textPatterns.some((pattern) => name.toLowerCase().includes(pattern));
}

function isStepsEventsPattern(name: string): boolean {
  return /^steps\..*\.events$/.test(name);
}
