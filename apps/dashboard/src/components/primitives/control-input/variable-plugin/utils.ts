import { EditorView } from '@uiw/react-codemirror';
import type { VariableMatch } from './types';

/**
 * Parses a variable match from the editor's content into structured data.
 * This function is crucial for the variable pill system as it:
 * 1. Extracts the position and content of variables like {{ subscriber.name | uppercase }}
 * 2. Separates the base variable name from its modifiers (filters after |)
 * 3. Provides the necessary information for rendering variable pills in the editor
 *
 * @example
 * Input match for "{{ subscriber.name | uppercase }}"
 * Returns:
 * {
 *   fullLiquidExpression: "subscriber.name | uppercase",
 *   name: "subscriber.name",
 *   start: [match start index],
 *   end: [match end index],
 *   modifiers: ["uppercase"]
 * }
 */
export function parseVariable(match: RegExpExecArray): VariableMatch {
  const start = match.index;
  const end = start + match[0].length;
  const fullLiquidExpression = match[1].trim();
  const parts = fullLiquidExpression.split('|').map((part) => part.trim());
  const name = parts[0];
  const hasModifiers = parts.length > 1;

  return {
    fullLiquidExpression,
    name,
    start,
    end,
    modifiers: hasModifiers ? parts.slice(1) : [],
  };
}

/**
 * Handles backspace behavior for variables in the editor.
 * When backspace is pressed near or within a variable, it removes the entire variable including its brackets.
 */
export function handleVariableBackspace(view: EditorView, pos: number, content: string): boolean {
  // Find the boundaries of the potential variable surrounding the cursor
  const lastOpenBrackets = content.lastIndexOf('{{', pos);
  const nextCloseBrackets = content.indexOf('}}', pos);

  if (lastOpenBrackets !== -1 && nextCloseBrackets !== -1) {
    const isAtStartOrInside = pos >= lastOpenBrackets && pos <= lastOpenBrackets + 2;
    const isBeforeVariable = pos === lastOpenBrackets;
    const isAfterVariable = pos === nextCloseBrackets + 3 && content[nextCloseBrackets + 2] === ' ';

    if (isAtStartOrInside || isBeforeVariable || isAfterVariable) {
      requestAnimationFrame(() => {
        const deleteEnd = nextCloseBrackets + 2;
        const hasSpaceAfter = content[deleteEnd] === ' ';
        const hasSpaceBefore = isBeforeVariable && content[lastOpenBrackets - 1] === ' ';

        // Dispatch a change to remove the variable and any surrounding spaces
        view.dispatch({
          changes: {
            from: hasSpaceBefore ? lastOpenBrackets - 1 : lastOpenBrackets,
            to: hasSpaceAfter ? deleteEnd + 1 : deleteEnd,
            insert: '',
          },
          // Place cursor where the variable started
          selection: { anchor: hasSpaceBefore ? lastOpenBrackets - 1 : lastOpenBrackets },
        });
      });

      return true; // Indicate that we handled the backspace
    }
  }

  return false; // Let CodeMirror handle the backspace normally
}

export function handleVariableCompletion(view: EditorView, pos: number, content: string): boolean {
  if (content.slice(pos - 2, pos) === '}}') {
    const start = content.lastIndexOf('{{', pos);
    if (start !== -1) {
      const variableContent = content.slice(start + 2, pos - 2).trim();
      if (variableContent) {
        const needsSpace = pos < content.length && content[pos] !== ' ' && content[pos] !== '\n';
        if (needsSpace) {
          requestAnimationFrame(() => {
            view.dispatch({
              changes: { from: pos, insert: ' ' },
              selection: { anchor: pos + 1 },
            });
          });
        }

        return true;
      }
    }
  }

  return false;
}

export function isTypingVariable(content: string, pos: number): boolean {
  const beforeCursor = content.slice(0, pos);
  const afterCursor = content.slice(pos);
  const lastOpenBrackets = beforeCursor.lastIndexOf('{{');
  const nextCloseBrackets = afterCursor.indexOf('}}');

  return lastOpenBrackets !== -1 && (nextCloseBrackets === -1 || beforeCursor.indexOf('}}', lastOpenBrackets) === -1);
}
