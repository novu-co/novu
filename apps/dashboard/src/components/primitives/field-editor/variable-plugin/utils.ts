import { EditorView } from '@uiw/react-codemirror';
import type { VariableMatch } from './types';

export function parseVariable(match: RegExpExecArray): VariableMatch {
  const start = match.index;
  const end = start + match[0].length;
  const fullVariableName = match[1].trim();
  const parts = fullVariableName.split('|').map((part) => part.trim());
  const variableName = parts[0];
  const hasModifiers = parts.length > 1;

  return {
    fullVariableName,
    variableName,
    start,
    end,
    hasModifiers,
  };
}

export function handleVariableBackspace(view: EditorView, pos: number, content: string): boolean {
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

        view.dispatch({
          changes: {
            from: hasSpaceBefore ? lastOpenBrackets - 1 : lastOpenBrackets,
            to: hasSpaceAfter ? deleteEnd + 1 : deleteEnd,
            insert: '',
          },
          selection: { anchor: hasSpaceBefore ? lastOpenBrackets - 1 : lastOpenBrackets },
        });
      });

      return true;
    }
  }

  return false;
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
