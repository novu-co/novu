import { EditorView } from '@uiw/react-codemirror';
import { MutableRefObject } from 'react';

export interface PluginState {
  viewRef: MutableRefObject<EditorView | null>;
  lastCompletionRef: MutableRefObject<{ from: number; to: number } | null>;
  onSelect?: (value: string, from: number, to: number) => void;
}

export interface VariableMatch {
  fullVariableName: string;
  variableName: string;
  start: number;
  end: number;
  hasModifiers: boolean;
}
