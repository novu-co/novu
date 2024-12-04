import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { materialDark } from '@uiw/codemirror-theme-material';
import { Check, Eye, EyeOff } from 'lucide-react';
import { RiFileCopyLine } from 'react-icons/ri';
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
  secretMask?: {
    line: number;
    maskStart?: number;
    maskEnd?: number;
  }[];
}

/**
 * A code block component that supports syntax highlighting and secret masking.
 *
 * @example
 * // Example 1: Basic usage with syntax highlighting
 * <CodeBlock
 *   code="const greeting = 'Hello, World!';"
 *   language="typescript"
 * />
 *
 * @example
 * // Example 2: Mask entire lines
 * <CodeBlock
 *   code={`const config = {
 *   apiKey: 'abc123xyz',
 *   secret: 'very-secret-value',
 *   debug: true
 * }`}
 *   secretMask={[
 *     { line: 2 }, // Masks the entire apiKey line
 *     { line: 3 }, // Masks the entire secret line
 *   ]}
 * />
 *
 * @example
 * // Example 3: Mask specific parts of lines
 * <CodeBlock
 *   code={`const config = {
 *   apiKey: 'abc123xyz',
 *   debug: true
 * }`}
 *   secretMask={[
 *     { line: 2, maskStart: 10, maskEnd: 21 }, // Only masks 'abc123xyz'
 *   ]}
 *   title="Configuration"
 * />
 */
export function CodeBlock({ code, language = 'typescript', title, className, secretMask = [] }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const hasSecrets = secretMask.length > 0;

  const getMaskedCode = () => {
    if (!hasSecrets || showSecrets) return code;

    const lines = code.split('\n');

    secretMask.forEach(({ line, maskStart, maskEnd }) => {
      if (line > lines.length) return;

      const lineIndex = line - 1;
      const lineContent = lines[lineIndex];

      if (maskStart !== undefined && maskEnd !== undefined) {
        // Mask only part of the line
        lines[lineIndex] =
          lineContent.substring(0, maskStart) + '•'.repeat(maskEnd - maskStart) + lineContent.substring(maskEnd);
      } else {
        // Mask the entire line
        lines[lineIndex] = '•'.repeat(lineContent.length);
      }
    });

    return lines.join('\n');
  };

  return (
    <div className={cn('w-full rounded-xl border bg-neutral-800 p-[5px] pt-0', className)}>
      <div className="flex items-center justify-between px-2 py-1">
        {title && <span className="text-foreground-400 text-xs">{title}</span>}
        <div className="ml-auto flex items-center gap-1">
          {hasSecrets && (
            <button
              onClick={() => setShowSecrets(!showSecrets)}
              className="text-foreground-400 hover:text-foreground-50 rounded-md p-2 transition-all duration-200 hover:bg-[#32424a] active:scale-95"
              title={showSecrets ? 'Hide secrets' : 'Reveal secrets'}
            >
              {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
          <button
            onClick={copyToClipboard}
            className="text-foreground-400 hover:text-foreground-50 rounded-md p-2 transition-all duration-200 hover:bg-[#32424a] active:scale-95"
            title="Copy code"
          >
            {isCopied ? <Check className="h-4 w-4" /> : <RiFileCopyLine className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <CodeMirror
        value={getMaskedCode()}
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
