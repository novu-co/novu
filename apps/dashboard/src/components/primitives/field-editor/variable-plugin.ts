import { EditorView, ViewPlugin, Decoration, DecorationSet } from '@uiw/react-codemirror';
import { MutableRefObject } from 'react';

interface PluginState {
  viewRef: MutableRefObject<EditorView | null>;
  lastCompletionRef: MutableRefObject<{ from: number; to: number } | null>;
}

export function createVariablePlugin({ viewRef, lastCompletionRef }: PluginState) {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      lastCursor: number = 0;

      constructor(view: EditorView) {
        this.decorations = this.createDecorations(view);
        viewRef.current = view;
      }

      update(update: any) {
        if (update.docChanged || update.viewportChanged || update.selectionSet) {
          this.lastCursor = update.state.selection.main.head;

          const content = update.state.doc.toString();
          const pos = update.state.selection.main.head;
          if (update.docChanged && content.slice(pos - 2, pos) === '}}') {
            const start = content.lastIndexOf('{{', pos);
            if (start !== -1) {
              const variableContent = content.slice(start + 2, pos - 2).trim();
              if (variableContent) {
                this.lastCursor = -1;
              }
            }
          }

          this.decorations = this.createDecorations(update.view);
        }
        if (update.view) {
          viewRef.current = update.view;
        }
      }

      createDecorations(view: EditorView) {
        const decorations: any[] = [];
        const content = view.state.doc.toString();
        const variableRegex = /{{([^{}]+)}}/g;
        let match;

        while ((match = variableRegex.exec(content)) !== null) {
          const start = match.index;
          const end = start + match[0].length;
          const variableName = match[1].trim();

          const isJustCompleted =
            lastCompletionRef.current &&
            start === lastCompletionRef.current.from - 2 &&
            end === lastCompletionRef.current.to + 2;

          if (variableName) {
            decorations.push(
              Decoration.mark({
                class: `cm-variable-pill ${document.documentElement.classList.contains('dark') ? 'cm-dark' : ''}`,
                attributes: {
                  'data-variable': variableName,
                  'data-start': start.toString(),
                  'data-end': end.toString(),
                },
                inclusive: true,
              }).range(start, end)
            );

            decorations.push(
              Decoration.mark({
                class: 'cm-bracket',
              }).range(start, start + 2)
            );
            decorations.push(
              Decoration.mark({
                class: 'cm-bracket',
              }).range(end - 2, end)
            );
          }
        }

        lastCompletionRef.current = null;

        return Decoration.set(decorations, true);
      }
    },
    {
      decorations: (v) => v.decorations,
      provide: (plugin) =>
        EditorView.atomicRanges.of((view) => {
          return view.plugin(plugin)?.decorations || Decoration.none;
        }),
    }
  );
}
