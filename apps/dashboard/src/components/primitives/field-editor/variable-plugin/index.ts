import { EditorView, ViewPlugin, Decoration } from '@uiw/react-codemirror';
import type { PluginState } from './types';
import { VariablePluginView } from './plugin-view';

export function createVariablePlugin({ viewRef, lastCompletionRef, onSelect }: PluginState) {
  return ViewPlugin.fromClass(
    class {
      private view: VariablePluginView;

      constructor(view: EditorView) {
        this.view = new VariablePluginView(view, viewRef, lastCompletionRef, onSelect);
      }

      update(update: any) {
        this.view.update(update);
      }

      get decorations() {
        return this.view.decorations;
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

export * from './types';
export * from './constants';
