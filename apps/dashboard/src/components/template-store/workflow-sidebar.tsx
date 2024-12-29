import {
  Calendar,
  Code2,
  ExternalLink,
  FileCode2,
  FileText,
  KeyRound,
  LayoutGrid,
  Users,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/primitives/button';
import { Textarea } from '@/components/primitives/textarea';
import { useEnvironment } from '@/context/environment/hooks';
import { showToast } from '@/components/primitives/sonner-helpers';
import { ToastIcon } from '@/components/primitives/sonner';
import { postV2 } from '@/api/api.client';
import { IWorkflowSuggestion } from './templates/types';

interface WorkflowSidebarProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  onSuggestionsGenerated?: (suggestions: IWorkflowSuggestion[]) => void;
}

const useCases = [
  {
    id: 'popular',
    icon: <LayoutGrid className="h-3 w-3 text-gray-700" />,
    label: 'Popular',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'events',
    icon: <Calendar className="h-3 w-3 text-gray-700" />,
    label: 'Events',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'authentication',
    icon: <KeyRound className="h-3 w-3 text-gray-700" />,
    label: 'Authentication',
    bgColor: 'bg-green-50',
  },
  {
    id: 'social',
    icon: <Users className="h-3 w-3 text-gray-700" />,
    label: 'Social',
    bgColor: 'bg-purple-50',
  },
] as const;

const createOptions = [
  {
    icon: <Code2 className="h-3 w-3 text-gray-700" />,
    label: 'Code-based workflow',
    hasExternalLink: true,
    bgColor: 'bg-blue-50',
  },
  {
    icon: <FileText className="h-3 w-3 text-gray-700" />,
    label: 'Blank workflow',
    bgColor: 'bg-green-50',
  },
];

export function WorkflowSidebar({ selectedCategory, onCategorySelect, onSuggestionsGenerated }: WorkflowSidebarProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { currentEnvironment } = useEnvironment();

  const handleSubmit = async () => {
    if (!prompt) return;

    setIsLoading(true);
    try {
      const { data } = await postV2<{ data: { suggestions: IWorkflowSuggestion[] } }>('/workflows/suggestions', {
        environment: currentEnvironment!,
        body: { prompt },
      });
      onSuggestionsGenerated?.(data.suggestions);
      setPrompt('');
    } catch (error) {
      showToast({
        children: () => (
          <>
            <ToastIcon variant="error" />
            <span className="text-sm">
              Failed to generate suggestions:{' '}
              {error instanceof Error ? error.message : 'There was an error generating workflow suggestions.'}
            </span>
          </>
        ),
        options: {
          position: 'bottom-right',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <section className="p-2">
        <div className="mb-2">
          <span className="text-subheading-2xs text-gray-500">AI SUGGESTIONS</span>
        </div>
        <div className="flex flex-col gap-2">
          <div className="border-stroke-soft rounded-xl border bg-white p-3">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-purple-50 p-[5px]">
                <Sparkles className="h-3 w-3 text-gray-700" />
              </div>
              <span className="text-label-sm text-strong-950">Generate workflows</span>
            </div>
            <p className="text-paragraph-xs mb-3 text-neutral-400">
              Describe your product and we'll suggest relevant workflows
            </p>
            <div className="flex flex-col gap-2">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., We're building a SaaS project management tool..."
                className="min-h-[80px] text-xs"
              />
              <Button onClick={handleSubmit} size="sm" className="w-full" isLoading={isLoading}>
                Generate
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="p-2">
        <div className="mb-2">
          <span className="text-subheading-2xs text-gray-500">USE CASES</span>
        </div>

        <div className="flex flex-col gap-2">
          {useCases.map((item) => (
            <div
              key={item.id}
              onClick={() => onCategorySelect(item.id)}
              className={`flex items-center gap-2 rounded-xl p-1.5 transition-colors hover:cursor-pointer hover:bg-gray-100 ${
                selectedCategory === item.id ? 'border border-[#EEEFF1] bg-white' : ''
              }`}
            >
              <div className={`rounded-lg p-[5px] ${item.bgColor}`}>{item.icon}</div>
              <span className="text-label-sm text-strong-950">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="p-2">
        <div className="mb-2">
          <span className="text-subheading-2xs text-gray-500">OR CREATE</span>
        </div>
        <div className="flex flex-col gap-2">
          {createOptions.map((item, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 rounded-xl p-1.5 transition-colors hover:cursor-pointer hover:bg-gray-100`}
            >
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-[5px] ${item.bgColor}`}>{item.icon}</div>
                <span className="text-label-sm text-strong-950">{item.label}</span>
              </div>
              {item.hasExternalLink && <ExternalLink className="text-foreground-600 ml-auto h-3 w-3" />}
            </div>
          ))}
        </div>
      </section>

      <div className="mt-auto p-3">
        <div className="border-stroke-soft flex flex-col items-start rounded-xl border bg-white p-3 hover:cursor-pointer">
          <div className="mb-1 flex items-center gap-1.5">
            <div className="rounded-lg bg-gray-50 p-1.5">
              <FileCode2 className="h-3 w-3 text-gray-700" />
            </div>
            <span className="text-label-sm text-strong-950">Documentation</span>
          </div>

          <p className="text-paragraph-xs text-neutral-400">Find out more about how to best setup workflows</p>
        </div>
      </div>
    </div>
  );
}
