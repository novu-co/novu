import { EditorView, ViewPlugin, Decoration, DecorationSet, WidgetType } from '@uiw/react-codemirror';
import { MutableRefObject } from 'react';

interface PluginState {
  viewRef: MutableRefObject<EditorView | null>;
  lastCompletionRef: MutableRefObject<{ from: number; to: number } | null>;
  onSelect?: (value: string, from: number, to: number) => void;
}

class VariablePillWidget extends WidgetType {
  constructor(
    private variableName: string,
    private fullVariableName: string,
    private start: number,
    private end: number,
    private hasModifiers: boolean,
    private onSelect?: (value: string, from: number, to: number) => void
  ) {
    super();
  }

  toDOM() {
    const span = document.createElement('span');
    const pillClass = `cm-variable-pill ${document.documentElement.classList.contains('dark') ? 'cm-dark' : ''} ${this.hasModifiers ? 'has-modifiers' : ''}`;
    span.className = pillClass;
    span.setAttribute('data-variable', this.fullVariableName);
    span.setAttribute('data-start', this.start.toString());
    span.setAttribute('data-end', this.end.toString());
    span.setAttribute('data-display', this.variableName);
    span.textContent = this.variableName;

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setTimeout(() => {
        this.onSelect?.(this.fullVariableName, this.start, this.end);
      }, 0);
    };

    span.addEventListener('mousedown', handleClick);
    (span as any)._variableClickHandler = handleClick;

    return span;
  }

  eq(other: VariablePillWidget) {
    return (
      other.variableName === this.variableName &&
      other.fullVariableName === this.fullVariableName &&
      other.start === this.start &&
      other.end === this.end &&
      other.hasModifiers === this.hasModifiers
    );
  }

  destroy(dom: HTMLElement) {
    if ((dom as any)._variableClickHandler) {
      dom.removeEventListener('mousedown', (dom as any)._variableClickHandler);
      delete (dom as any)._variableClickHandler;
    }
  }

  ignoreEvent() {
    return false;
  }
}

export function createVariablePlugin({ viewRef, lastCompletionRef, onSelect }: PluginState) {
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
                if (pos === content.length || content[pos] !== ' ') {
                  requestAnimationFrame(() => {
                    update.view.dispatch({
                      changes: { from: pos, insert: ' ' },
                      selection: { anchor: pos + 1 },
                    });
                  });
                }
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
          const fullVariableName = match[1].trim();

          const parts = fullVariableName.split('|').map((part) => part.trim());
          const variableName = parts[0];
          const hasModifiers = parts.length > 1;

          if (variableName) {
            decorations.push(
              Decoration.replace({
                widget: new VariablePillWidget(variableName, fullVariableName, start, end, hasModifiers, onSelect),
                inclusive: true,
                side: 1,
              }).range(start, end)
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
