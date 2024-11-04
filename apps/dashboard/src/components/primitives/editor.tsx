import { useEffect, useRef } from 'react';
import { useCodeMirror, EditorView } from '@uiw/react-codemirror';
import { LiquidHTML } from 'codemirror-lang-liquid';
import { cva, VariantProps } from 'class-variance-authority';
import createTheme from '@uiw/codemirror-themes';

const editorVariants = cva('-mx-1 -mt-[2px] h-full w-full flex-1 [&_.cm-focused]:outline-none', {
  variants: {
    size: {
      default: 'text-xs [&_.cm-editor]:py-1',
      md: 'text-sm [&_.cm-editor]:py-2',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

const theme = createTheme({
  theme: 'light',
  styles: [],
  settings: {
    background: 'transparent',
    lineHighlight: 'transparent',
  },
});

type EditorProps = {
  value: string;
  placeholder?: string;
  className?: string;
  height?: string;
  onChange: (val: string) => void;
} & VariantProps<typeof editorVariants>;

export const Editor = ({ value, placeholder, className, height, size, onChange }: EditorProps) => {
  const editor = useRef<HTMLDivElement>(null);
  const { setContainer } = useCodeMirror({
    extensions: [LiquidHTML({}), EditorView.lineWrapping],
    height,
    placeholder,
    basicSetup: {
      lineNumbers: false,
      foldGutter: false,
      defaultKeymap: false,
      highlightActiveLine: false,
      highlightActiveLineGutter: false,
      indentOnInput: false,
      searchKeymap: false,
    },
    container: editor.current,
    value,
    onChange,
    theme,
  });

  useEffect(() => {
    if (editor.current) {
      setContainer(editor.current);
    }
  }, [setContainer]);

  return <div ref={editor} className={editorVariants({ size, className })} />;
};
