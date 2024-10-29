import { Editor } from '@monaco-editor/react';
import type { SnippetLanguage } from './types';

export const SnippetEditor = ({ language, value }: { language: SnippetLanguage; value: string }) => {
  const editorLanguage = language === 'framework' ? 'typescript' : language;

  return (
    <Editor
      defaultLanguage={editorLanguage}
      language={editorLanguage}
      className="h-full"
      options={{
        minimap: {
          enabled: false,
        },
        // workaround from: https://github.com/microsoft/monaco-editor/issues/2093
        accessibilitySupport: 'off',
        renderLineHighlight: 'none',
        scrollBeyondLastLine: false,
        fontSize: 14,
        lineHeight: 20,
        readOnly: true,
      }}
      value={value}
    />
  );
};
