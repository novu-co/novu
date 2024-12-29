import { ComponentProps, useState } from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/components/primitives/dialog';
import { Button } from '@/components/primitives/button';
import { CreateWorkflowButton } from '../create-workflow-button';
import { WorkflowCard } from './workflow-card';
import { WorkflowSidebar } from './workflow-sidebar';
import { RouteFill } from '../icons';
import { Form } from '../primitives/form/form';
import { useForm } from 'react-hook-form';
import { getTemplates } from './templates';
import { IWorkflowSuggestion } from './templates/types';

type WorkflowTemplateModalProps = ComponentProps<typeof DialogTrigger>;

const WORKFLOW_TEMPLATES = getTemplates();

export function WorkflowTemplateModal(props: WorkflowTemplateModalProps) {
  const form = useForm();
  const [selectedCategory, setSelectedCategory] = useState<string>('popular');
  const [suggestions, setSuggestions] = useState<IWorkflowSuggestion[]>([]);

  const filteredTemplates = WORKFLOW_TEMPLATES.filter((template) => template.category === selectedCategory);
  const templates = suggestions.length > 0 ? suggestions : filteredTemplates;

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
            <div className="flex h-[700px]">
              {/* Sidebar */}
              <div className="h-full w-[259px] border-r border-neutral-200">
                <WorkflowSidebar
                  selectedCategory={selectedCategory}
                  onCategorySelect={(category) => {
                    setSelectedCategory(category);
                    setSuggestions([]);
                  }}
                  onSuggestionsGenerated={setSuggestions}
                />
              </div>

              {/* Main Content */}
              <div className="w-full flex-1 p-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <h2 className="text-label-md text-strong">
                    {suggestions.length > 0
                      ? 'AI Suggested workflows'
                      : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} workflows`}
                  </h2>
                </div>

                <div className="grid grid-cols-3 gap-4 py-3 pt-3">
                  {templates.map((template) => (
                    <CreateWorkflowButton key={template.id} asChild template={template.workflowDefinition}>
                      <WorkflowCard
                        name={template.name}
                        template={template.workflowDefinition}
                        description={template.description}
                        steps={template.workflowDefinition.steps.map((step) => step.type)}
                      />
                    </CreateWorkflowButton>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex w-full items-center justify-end gap-2 border-t border-neutral-200 p-2">
              <CreateWorkflowButton asChild>
                <Button variant="outline" size="sm">
                  Create blank workflow
                </Button>
              </CreateWorkflowButton>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
