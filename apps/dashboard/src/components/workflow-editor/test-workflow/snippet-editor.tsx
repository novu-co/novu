import { Editor } from '@/components/primitives/editor';
import { LanguageName, loadLanguage } from '@uiw/codemirror-extensions-langs';
import { EditorView } from '@uiw/react-codemirror';
import { useMemo } from 'react';
import type { SnippetLanguage } from './types';

const basicSetup = { lineNumbers: true };

export const SnippetEditor = ({
  language,
  value,
  readOnly = false,
}: {
  language: SnippetLanguage;
  value: string;
  readOnly?: boolean;
}) => {
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
      readOnly={readOnly}
      lang={editorLanguage}
      className="h-full"
      value={value}
      extensions={extensions}
      basicSetup={basicSetup}
    />
  );
};
