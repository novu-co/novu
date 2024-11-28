import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { materialDark } from '@uiw/codemirror-theme-material';
import { Check } from 'lucide-react';
import { RiFileCopyLine, RiStackFill } from 'react-icons/ri';
import { cn } from '../../utils/ui';
import { langs, loadLanguage } from '@uiw/codemirror-extensions-langs';

loadLanguage('tsx');
loadLanguage('json');
loadLanguage('shell');
loadLanguage('typescript');

const languageMap = {
  typescript: langs.typescript,
  tsx: langs.tsx,
  json: langs.json,
  shell: langs.shell,
} as const;

export type Language = keyof typeof languageMap;

interface CodeBlockProps {
  code: string;
  language?: Language;
  title?: string;
  className?: string;
}

export function CodeBlock({ code, language = 'typescript', title, className }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className={cn('w-full rounded-xl border bg-neutral-800 p-[5px] pt-0', className)}>
      <div className="flex items-center justify-between px-2 py-1">
        {title && <span className="text-foreground-400 text-xs">{title}</span>}
        <button
          onClick={copyToClipboard}
          className="text-foreground-400 hover:text-foreground-50 ml-auto rounded-md p-2 transition-all duration-200 hover:bg-[#32424a] active:scale-95"
          title="Copy code"
        >
          {isCopied ? <Check className="h-4 w-4" /> : <RiFileCopyLine className="h-4 w-4" />}
        </button>
      </div>
      <CodeMirror
        value={code}
        theme={materialDark}
        extensions={[languageMap[language]()]}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: false,
          highlightActiveLine: false,
          foldGutter: false,
        }}
        editable={false}
        className="overflow-hidden rounded-lg text-xs [&_.cm-gutters]:bg-[#263238] [&_.cm-scroller]:font-mono"
      />
    </div>
  );
}
