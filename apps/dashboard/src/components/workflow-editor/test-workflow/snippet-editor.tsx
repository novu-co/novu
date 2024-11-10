import { useMemo } from 'react';
import { EditorView } from '@uiw/react-codemirror';
import { loadLanguage, LanguageName } from '@uiw/codemirror-extensions-langs';
import { Editor } from '@/components/primitives/editor';
import type { SnippetLanguage } from './types';

export const SnippetEditor = ({ language, value }: { language: SnippetLanguage; value: string }) => {
  const editorLanguage: LanguageName = language === 'framework' ? 'typescript' : language;

  const extensions = useMemo(() => {
    const res = [EditorView.lineWrapping];
    const langExtension = loadLanguage(editorLanguage)?.extension;
    if (langExtension) {
      res.push(langExtension);
    }
    return res;
  }, [editorLanguage]);

  return (
    <Editor
      lang={editorLanguage}
      className="h-full"
      value={value}
      extensions={extensions}
      basicSetup={{ lineNumbers: true }}
    />
  );
};
