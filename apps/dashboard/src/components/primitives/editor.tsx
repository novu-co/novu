import { useEffect, useRef } from 'react';
import { tags as t } from '@lezer/highlight';
import { useCodeMirror, EditorView, ReactCodeMirrorProps } from '@uiw/react-codemirror';
import { cva, VariantProps } from 'class-variance-authority';
import createTheme from '@uiw/codemirror-themes';
import { autocompleteFooter, autocompleteHeader, functionIcon } from './constants';

const editorVariants = cva('-mx-1 mt-[2px] h-full w-full flex-1 [&_.cm-focused]:outline-none', {
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

const baseTheme = EditorView.baseTheme({
  '&light': {
    backgroundColor: 'transparent',
  },
  '.cm-tooltip-autocomplete .cm-completionIcon-variable': {
    '&:after': {
      content: "''",
      height: '16px',
      width: '16px',
      display: 'block',
      backgroundRepeat: 'no-repeat',
      backgroundImage: `url('${functionIcon}')`,
    },
  },
  '.cm-tooltip-autocomplete.cm-tooltip': {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--neutral-100)',
    backgroundColor: 'hsl(var(--background))',
    boxShadow: '0px 1px 3px 0px rgba(16, 24, 40, 0.10), 0px 1px 2px 0px rgba(16, 24, 40, 0.06)',
    '&:before': {
      content: "''",
      top: '0',
      left: '0',
      right: '0',
      height: '30px',
      display: 'block',
      backgroundRepeat: 'no-repeat',
      backgroundImage: `url('${autocompleteHeader}')`,
    },
    '&:after': {
      content: "''",
      bottom: '30px',
      left: '0',
      right: '0',
      height: '30px',
      display: 'block',
      backgroundRepeat: 'no-repeat',
      backgroundImage: `url('${autocompleteFooter}')`,
    },
  },
  '.cm-tooltip-autocomplete.cm-tooltip > ul[role="listbox"]': {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    maxHeight: '12rem',
    margin: '4px 0',
    padding: '4px',
  },
  '.cm-tooltip-autocomplete.cm-tooltip > ul > li[role="option"]': {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px',
    fontSize: '12px',
    fontWeight: '500',
    lineHeight: '16px',
    minHeight: '24px',
    color: 'var(--foreground-950)',
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  '.cm-tooltip-autocomplete.cm-tooltip > ul > li[aria-selected="true"]': {
    backgroundColor: 'hsl(var(--neutral-100))',
  },
  '.cm-tooltip-autocomplete.cm-tooltip .cm-completionIcon': {
    padding: '0',
    width: '16px',
    height: '16px',
  },
  '.cm-line span.cm-matchingBracket': {
    backgroundColor: 'hsl(var(--highlighted) / 0.1)',
  },
  'div.cm-content': {
    padding: 0,
  },
  'div.cm-gutters': {
    backgroundColor: 'transparent',
    borderRight: 'none',
    color: 'hsl(var(--foreground-400))',
  },
});

const theme = createTheme({
  theme: 'light',
  styles: [
    { tag: t.keyword, color: 'hsl(var(--feature))' },
    { tag: t.string, color: 'hsl(var(--highlighted))' },
    { tag: t.operatorKeyword, color: 'hsl(var(--highlighted))' },
    { tag: t.function(t.variableName), color: 'hsl(var(--information))' },
    { tag: t.brace, color: 'hsl(var(--foreground-400))' },
    { tag: t.variableName, color: 'hsl(var(--foreground-950))' },
  ],
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
  onChange?: (val: string) => void;
} & ReactCodeMirrorProps &
  VariantProps<typeof editorVariants>;

export const Editor = ({
  value,
  placeholder,
  className,
  height,
  size,
  onChange,
  extensions,
  basicSetup,
  ...restCodeMirrorProps
}: EditorProps) => {
  const editor = useRef<HTMLDivElement>(null);
  const { setContainer } = useCodeMirror({
    extensions: [...(extensions ?? []), baseTheme],
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
      ...(typeof basicSetup === 'object' ? basicSetup : {}),
    },
    container: editor.current,
    value,
    onChange,
    theme,
    lang: 'liquid',
    ...restCodeMirrorProps,
  });

  useEffect(() => {
    if (editor.current) {
      setContainer(editor.current);
    }
  }, [setContainer]);

  return <div ref={editor} className={editorVariants({ size, className })} />;
};
