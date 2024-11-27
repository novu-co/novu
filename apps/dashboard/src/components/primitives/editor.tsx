import React, { useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useCodeMirror, ReactCodeMirrorProps, EditorView } from '@uiw/react-codemirror';
import createTheme from '@uiw/codemirror-themes';
import { tags as t } from '@lezer/highlight';
import { cva, VariantProps } from 'class-variance-authority';
import debounce from 'lodash.debounce';

const editorVariants = cva('h-full w-full flex-1 [&_.cm-focused]:outline-none', {
  variants: {
    size: {
      default: 'text-xs [&_.cm-editor]:py-1',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

const baseTheme = (options: { asInput?: boolean }) =>
  EditorView.baseTheme({
    '&light': { backgroundColor: 'transparent' },
    ...(options.asInput && {
      '.cm-scroller': { overflow: 'hidden' },
    }),
  });

type EditorProps = {
  value: string;
  asInput?: boolean;
  placeholder?: string;
  className?: string;
  height?: string;
  onChange?: (value: string) => void;
  fontFamily?: 'inherit';
} & ReactCodeMirrorProps &
  VariantProps<typeof editorVariants>;

export const Editor = React.forwardRef<{ focus: () => void; blur: () => void }, EditorProps>(
  (
    {
      value,
      placeholder,
      className,
      height,
      size,
      asInput,
      fontFamily,
      onChange,
      extensions,
      basicSetup,
      ...restCodeMirrorProps
    },
    ref
  ) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [shouldFocus, setShouldFocus] = useState(false);

    const theme = useMemo(
      () =>
        createTheme({
          theme: 'light',
          styles: [
            { tag: t.keyword, color: 'hsl(var(--feature))' },
            { tag: t.string, color: 'hsl(var(--highlighted))' },
            { tag: t.function(t.variableName), color: 'hsl(var(--information))' },
          ],
          settings: {
            background: 'transparent',
            fontFamily: fontFamily === 'inherit' ? 'inherit' : undefined,
          },
        }),
      [fontFamily]
    );

    const debouncedOnChange = useMemo(
      () =>
        debounce((value: string) => {
          if (onChange) onChange(value);
        }, 50),
      [onChange]
    );

    const { setContainer, view } = useCodeMirror({
      extensions: [...(extensions ?? []), baseTheme({ asInput })],
      height,
      placeholder,
      basicSetup: {
        lineNumbers: false,
        foldGutter: false,
        highlightActiveLine: false,
        ...((typeof basicSetup === 'object' ? basicSetup : {}) ?? {}),
      },
      container: editorRef.current,
      value,
      onChange: debouncedOnChange,
      theme,
      ...restCodeMirrorProps,
    });

    useImperativeHandle(
      ref,
      () => ({
        focus: () => setShouldFocus(true),
        blur: () => setShouldFocus(false),
      }),
      []
    );

    useEffect(() => {
      if (editorRef.current) {
        setContainer(editorRef.current);
      }
    }, [setContainer]);

    useLayoutEffect(() => {
      if (view && shouldFocus) {
        view.focus();
        setShouldFocus(false);
      }
    }, [shouldFocus, view]);

    useEffect(() => {
      return () => {
        debouncedOnChange.cancel();
      };
    }, [debouncedOnChange]);

    return <div ref={editorRef} className={editorVariants({ size, className })} />;
  }
);
