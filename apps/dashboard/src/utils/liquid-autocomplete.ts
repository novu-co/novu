import { LiquidVariable } from '@/utils/parseStepVariablesToLiquidVariables';
import { CompletionContext, CompletionResult } from '@codemirror/autocomplete';

export const completions =
  (variables: LiquidVariable[]) =>
  (context: CompletionContext): CompletionResult | null => {
    const { state, pos } = context;

    const beforeCursor = state.sliceDoc(0, pos);

    // Determine whether we're inside a {{ ... }} block
    const lastOpenBrace = beforeCursor.lastIndexOf('{{');
    const lastCloseBrace = beforeCursor.lastIndexOf('}}');

    if (lastOpenBrace === -1 || lastOpenBrace < lastCloseBrace) {
      // Not inside a {{ ... }} block
      return null;
    }

    // Get the content inside the braces up to the cursor position
    const insideBraces = state.sliceDoc(lastOpenBrace + 2, pos);

    // Match a word or variable part near the cursor
    const word = context.matchBefore(/[\w.]+/);

    // Check if there's already content before the current word
    let contentBeforeWord = '';
    if (word) {
      contentBeforeWord = insideBraces.slice(0, word.from - (lastOpenBrace + 2));
    } else {
      contentBeforeWord = insideBraces;
    }

    if (contentBeforeWord.trim().length > 0) {
      // There is already content inside the braces before the current word
      return null;
    }

    // If no word is matched and the block is empty, return all variables
    if (!word && pos === lastOpenBrace + 2) {
      return {
        from: pos,
        options: variables.map((v) => ({
          label: v.label,
          type: 'variable',
        })),
      };
    }

    // Show suggestions while typing a valid word
    if (word) {
      return {
        from: word.from,
        options: variables.map((v) => ({
          label: v.label,
          type: 'variable',
        })),
      };
    }

    return null; // Fallback to null if no conditions match
  };
