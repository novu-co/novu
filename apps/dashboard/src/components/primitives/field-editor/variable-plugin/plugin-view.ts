import { EditorView, Decoration, DecorationSet } from '@uiw/react-codemirror';
import { MutableRefObject } from 'react';
import { VARIABLE_REGEX } from './constants';
import { VariablePillWidget } from './variable-pill-widget';
import { handleVariableBackspace, handleVariableCompletion, isTypingVariable, parseVariable } from './utils';

export class VariablePluginView {
  decorations: DecorationSet;
  lastCursor: number = 0;
  isTypingVariable: boolean = false;

  constructor(
    private view: EditorView,
    private viewRef: MutableRefObject<EditorView | null>,
    private lastCompletionRef: MutableRefObject<{ from: number; to: number } | null>,
    private onSelect?: (value: string, from: number, to: number) => void
  ) {
    this.decorations = this.createDecorations(view);
    viewRef.current = view;
  }

  update(update: any) {
    if (update.docChanged || update.viewportChanged || update.selectionSet) {
      const pos = update.state.selection.main.head;
      const content = update.state.doc.toString();

      this.isTypingVariable = isTypingVariable(content, pos);

      // Handle backspace inside a variable
      if (update.docChanged && update.changes.desc === 'input.delete.backward') {
        if (handleVariableBackspace(update.view, pos, content)) {
          return;
        }
      }

      // Handle variable completion
      if (update.docChanged) {
        handleVariableCompletion(update.view, pos, content);
      }

      this.decorations = this.createDecorations(update.view);
    }

    if (update.view) {
      this.viewRef.current = update.view;
    }
  }

  createDecorations(view: EditorView) {
    const decorations: any[] = [];
    const content = view.state.doc.toString();
    const pos = view.state.selection.main.head;
    let match;

    while ((match = VARIABLE_REGEX.exec(content)) !== null) {
      const { fullVariableName, variableName, start, end, hasModifiers } = parseVariable(match);

      // Don't create a pill if we're currently editing this variable
      if (this.isTypingVariable && pos > start && pos < end) {
        continue;
      }

      if (variableName) {
        decorations.push(
          Decoration.replace({
            widget: new VariablePillWidget(variableName, fullVariableName, start, end, hasModifiers, this.onSelect),
            inclusive: false,
            side: -1,
          }).range(start, end)
        );
      }
    }

    this.lastCompletionRef.current = null;

    return Decoration.set(decorations, true);
  }
}
