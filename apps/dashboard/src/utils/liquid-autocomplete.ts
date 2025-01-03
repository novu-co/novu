import { TRANSFORMERS } from '@/components/primitives/field-editor/variable-popover/constants';
import { LiquidVariable } from '@/utils/parseStepVariablesToLiquidVariables';
import { CompletionContext, CompletionResult } from '@codemirror/autocomplete';

interface CompletionOption {
  label: string;
  type: string;
  boost?: number;
}

function isInsideLiquidBlock(beforeCursor: string): boolean {
  const lastOpenBrace = beforeCursor.lastIndexOf('{{');
  const lastCloseBrace = beforeCursor.lastIndexOf('}}');

  return lastOpenBrace !== -1 && lastOpenBrace > lastCloseBrace;
}

function getContentAfterPipe(content: string): string | null {
  const pipeIndex = content.lastIndexOf('|');
  if (pipeIndex === -1) return null;

  return content.slice(pipeIndex + 1).trimStart();
}

function getFilterCompletions(afterPipe: string): CompletionOption[] {
  return TRANSFORMERS.filter((f) => f.label.toLowerCase().startsWith(afterPipe.toLowerCase())).map((f) => ({
    label: f.value,
    type: 'function',
  }));
}

interface PathConfig {
  prefix: string;
  getPath: (text: string) => string | null;
  getPrefix: (text: string) => string;
}

const VARIABLE_PATHS: PathConfig[] = [
  {
    prefix: 'payload.',
    getPath: (text) => text.slice(8),
    getPrefix: () => 'payload.',
  },
  {
    prefix: 'subscriber.data.',
    getPath: (text) => text.slice(15),
    getPrefix: () => 'subscriber.data.',
  },
  {
    prefix: 'steps.',
    getPath: (text) => {
      const fullMatch = text.match(/^steps\.[^.]+\.events\[\d+\]\.payload\.(.*?)$/);
      if (fullMatch) return fullMatch[1];

      // Handle partial paths
      if (text === 'steps.' || text.startsWith('steps.')) return '';
      return null;
    },
    getPrefix: (text) => {
      const match = text.match(/^(steps\.[^.]+\.events\[\d+\]\.payload)\./);
      if (match) return `${match[1]}.`;

      // For partial paths, return what we have so far
      return text;
    },
  },
];

function getVariableSuggestions(
  word: { text: string; from: number; to?: number },
  variables: LiquidVariable[],
  pathConfig: PathConfig
): CompletionOption[] {
  const path = pathConfig.getPath(word.text);
  if (path === null) return [];

  const prefix = pathConfig.getPrefix(word.text);
  const existingVariables = variables.filter((v) => {
    if (pathConfig.prefix === 'steps.') {
      // For partial paths, show all step variables
      if (word.text === 'steps.' || (word.text.startsWith('steps.') && !word.text.includes('events'))) {
        return v.label.startsWith('steps.');
      }

      const stepMatch = word.text.match(/^steps\.([^.]+)\.events\[(\d+)\]/);
      if (!stepMatch) return false;
      const [, stepId, eventIndex] = stepMatch;
      return v.label.startsWith(`steps.${stepId}.events[${eventIndex}].payload.`);
    }
    return v.label.startsWith(pathConfig.prefix);
  });

  const suggestions: CompletionOption[] = existingVariables
    .filter((v) => path === '' || v.label.toLowerCase().includes(path.toLowerCase()))
    .map((v) => ({
      label: v.label,
      type: 'variable',
    }));

  if (path && !existingVariables.some((v) => v.label === `${prefix}${path}`)) {
    suggestions.unshift({
      label: `${prefix}${path}`,
      type: 'variable',
      boost: 99,
    });
  }

  return suggestions;
}

function getVariableCompletions(
  word: { text: string; from: number; to?: number } | null,
  pos: number,
  variables: LiquidVariable[]
): CompletionResult | null {
  if (!word && !variables.length) return null;

  for (const pathConfig of VARIABLE_PATHS) {
    if (word?.text.startsWith(pathConfig.prefix)) {
      const suggestions = getVariableSuggestions(word, variables, pathConfig);

      return {
        from: word.from,
        to: word.to ?? pos,
        options: suggestions,
      };
    }
  }

  if (word) {
    const matchingVariables = variables.filter((v) => v.label.toLowerCase().includes(word.text.toLowerCase()));

    return {
      from: word.from,
      to: word.to ?? pos,
      options: matchingVariables.map((v) => ({
        label: v.label,
        type: 'variable',
      })),
    };
  }

  return {
    from: pos,
    options: variables.map((v) => ({
      label: v.label,
      type: 'variable',
    })),
  };
}

export const completions =
  (variables: LiquidVariable[]) =>
  (context: CompletionContext): CompletionResult | null => {
    const { state, pos } = context;
    const beforeCursor = state.sliceDoc(0, pos);

    if (!isInsideLiquidBlock(beforeCursor)) {
      return null;
    }

    const lastOpenBrace = beforeCursor.lastIndexOf('{{');
    const insideBraces = state.sliceDoc(lastOpenBrace + 2, pos);
    const afterPipe = getContentAfterPipe(insideBraces);

    if (afterPipe !== null) {
      const filterCompletions = getFilterCompletions(afterPipe);

      return {
        from: pos - afterPipe.length,
        to: pos,
        options: filterCompletions,
      };
    }

    const word = context.matchBefore(/[\w.]+/);

    return getVariableCompletions(word, pos, variables);
  };
