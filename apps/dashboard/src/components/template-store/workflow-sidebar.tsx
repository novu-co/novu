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
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/components/primitives/dialog';
import { Button } from '@/components/primitives/button';
import { Textarea } from '@/components/primitives/textarea';
import { useEnvironment } from '@/context/environment/hooks';
import { showToast } from '@/components/primitives/sonner-helpers';
import { ToastIcon } from '@/components/primitives/sonner';
import { Badge } from '@/components/primitives/badge';
import { CreateWorkflowButton } from '@/components/create-workflow-button';
import { postV2 } from '@/api/api.client';

interface WorkflowSidebarProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
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

function AISuggestionsDialog() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const { currentEnvironment } = useEnvironment();

  const handleSubmit = async () => {
    if (!prompt) return;

    setIsLoading(true);
    try {
      const { data } = await postV2<{ data: { suggestions: any[] } }>('/workflows/suggestions', {
        environment: currentEnvironment!,
        body: { prompt },
      });
      setSuggestions(data.suggestions);
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
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex items-center gap-2 rounded-xl p-1.5 transition-colors hover:cursor-pointer hover:bg-gray-100">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-[5px]">
              <Sparkles className="h-3 w-3 text-gray-700" />
            </div>
            <span className="text-label-sm text-strong-950">AI Suggestions</span>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex flex-col items-center gap-6 p-4">
            <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
              <Sparkles className="size-6" />
            </div>
            <div className="text-center">
              <h2 className="text-foreground-900 mb-2 text-xl font-semibold">Tell us about your product</h2>
              <p className="text-foreground-600 text-sm">
                Share details about your product or company, and we'll help you create the perfect notification
                workflows.
              </p>
            </div>
          </div>
        </DialogHeader>
        <div className="flex flex-col gap-4 p-4 pt-2">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., We're building a SaaS project management tool with team collaboration features..."
            className="min-h-[120px]"
          />
          <Button onClick={handleSubmit} className="w-full" isLoading={isLoading}>
            Generate Suggestions
          </Button>

          {suggestions.length > 0 && (
            <div className="mt-4">
              <h3 className="text-foreground-900 mb-3 text-lg font-semibold">Suggested Workflows</h3>
              <div className="flex flex-col gap-3">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="border-border bg-background hover:bg-muted flex flex-col gap-2 rounded-lg border p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-foreground-900 font-medium">{suggestion.name}</h4>
                        <p className="text-foreground-600 text-sm">{suggestion.description}</p>
                      </div>
                      <CreateWorkflowButton template={suggestion.workflowDefinition} asChild>
                        <Button variant="ghost" size="sm">
                          Use
                        </Button>
                      </CreateWorkflowButton>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="soft">{suggestion.category}</Badge>
                      <Badge variant="outline">{suggestion.workflowDefinition.steps.length} steps</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

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

export function WorkflowSidebar({ selectedCategory, onCategorySelect }: WorkflowSidebarProps) {
  return (
    <div className="flex h-full flex-col bg-gray-50">
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
          <AISuggestionsDialog />
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
