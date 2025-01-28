import { CodeBlock, Language } from '../../primitives/code-block';

export const SnippetEditor = ({ language, value }: { language: Language; value: string }) => {
  return <CodeBlock theme="light" className="h-full" language={language} code={value} />;
};
