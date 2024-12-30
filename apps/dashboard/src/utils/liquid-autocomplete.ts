import { LiquidVariable } from '@/utils/parseStepVariablesToLiquidVariables';
import { CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import { TRANSFORMERS } from '@/components/primitives/field-editor/variable-popover/constants';

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

function getVariableCompletions(
  word: { text: string; from: number; to?: number } | null,
  pos: number,
  variables: LiquidVariable[]
): CompletionResult | null {
  if (!word && !variables.length) return null;

  if (word?.text.startsWith('payload.')) {
    const payloadPath = word.text.slice(8);
    const existingVariables = variables.filter((v) => v.label.startsWith('payload.'));

    const suggestions: CompletionOption[] = existingVariables
      .filter((v) => v.label.toLowerCase().includes(payloadPath.toLowerCase()))
      .map((v) => ({
        label: v.label,
        type: 'variable',
      }));

    if (payloadPath && !existingVariables.some((v) => v.label === `payload.${payloadPath}`)) {
      suggestions.unshift({
        label: `payload.${payloadPath}`,
        type: 'variable',
        boost: 99,
      });
    }

    return {
      from: word.from,
      to: word.to ?? pos,
      options: suggestions,
    };
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
