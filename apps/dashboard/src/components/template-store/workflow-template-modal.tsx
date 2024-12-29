import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/components/primitives/dialog';
import { showToast } from '@/components/primitives/sonner-helpers';
import { ToastIcon } from '@/components/primitives/sonner';
import { Form } from '../primitives/form/form';
import { useForm } from 'react-hook-form';
import { getTemplates, IWorkflowSuggestion } from './templates';
import { RouteFill } from '../icons';
import { WorkflowMode, WorkflowTemplateModalProps } from './types';
import { WorkflowSidebar } from './workflow-sidebar';
import { WorkflowGenerate } from './components/workflow-generate';
import { WorkflowResults } from './components/workflow-results';
import { useGenerateWorkflowSuggestions } from '@/hooks/workflows/use-generate-workflow-suggestions';

const WORKFLOW_TEMPLATES = getTemplates();

export function WorkflowTemplateModal(props: WorkflowTemplateModalProps) {
  const form = useForm();
  const [selectedCategory, setSelectedCategory] = useState<string>('popular');
  const [suggestions, setSuggestions] = useState<IWorkflowSuggestion[]>([]);
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<WorkflowMode>(WorkflowMode.TEMPLATES);
  const { mutateAsync: generateSuggestions, isPending: isGenerating } = useGenerateWorkflowSuggestions();

  const filteredTemplates = WORKFLOW_TEMPLATES.filter((template) =>
    selectedCategory === 'popular' ? template.isPopular : template.category === selectedCategory
  );
  const templates = suggestions.length > 0 ? suggestions : filteredTemplates;

  const handleSubmit = async () => {
    if (!prompt) return;

    try {
      const suggestions = await generateSuggestions({ prompt, mode });

      console.log(suggestions);

      setSuggestions(suggestions);
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
    }
  };

  const getHeaderText = () => {
    if (mode === WorkflowMode.GENERATE) {
      return 'AI Suggested workflows';
    }

    if (mode === WorkflowMode.FROM_PROMPT) {
      return 'Scaffold your workflow';
    }

    if (mode === WorkflowMode.TEMPLATES) {
      return `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} workflows`;
    }

    return '';
  };

  return (
    <Dialog>
      <DialogTrigger asChild {...props} />

      <DialogContent className="w-full max-w-[1240px] p-0">
        <Form {...form}>
          <form>
            <DialogHeader className="border-stroke-soft flex flex-row gap-1 border-b p-3">
              <RouteFill className="size-5" />
              <div className="text-label-sm !mt-0">Create a workflow</div>
            </DialogHeader>
            <div className="flex h-[600px]">
              <div className="h-full w-[259px] border-r border-neutral-200">
                <WorkflowSidebar
                  selectedCategory={selectedCategory}
                  onCategorySelect={(category) => {
                    setSelectedCategory(category);
                    setSuggestions([]);
                    setMode(WorkflowMode.TEMPLATES);
                  }}
                  onGenerateClick={() => {
                    setSuggestions([]);
                    setPrompt('');
                    setMode(WorkflowMode.GENERATE);
                  }}
                  onFromPromptClick={() => {
                    setSuggestions([]);
                    setPrompt('');
                    setMode(WorkflowMode.FROM_PROMPT);
                  }}
                  mode={mode}
                />
              </div>

              <div className="w-full flex-1 overflow-auto p-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <h2 className="text-label-md text-strong">{getHeaderText()}</h2>
                </div>

                {mode !== WorkflowMode.TEMPLATES ? (
                  <WorkflowGenerate
                    mode={mode}
                    prompt={prompt}
                    setPrompt={setPrompt}
                    isGenerating={isGenerating}
                    handleSubmit={handleSubmit}
                    suggestions={suggestions}
                  />
                ) : (
                  <WorkflowResults mode={mode} suggestions={templates} />
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
