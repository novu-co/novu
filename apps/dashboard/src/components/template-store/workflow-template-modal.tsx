import { ComponentProps, useState } from 'react';
import { RiArrowRightSLine } from 'react-icons/ri';

import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/components/primitives/dialog';
import { Button } from '@/components/primitives/button';
import { CreateWorkflowButton } from '../create-workflow-button';
import { WorkflowCard } from './workflow-card';
import { WorkflowSidebar } from './workflow-sidebar';
import { RouteFill } from '../icons';
import { Form } from '../primitives/form/form';
import { useForm } from 'react-hook-form';
import { StepTypeEnum, WorkflowCreationSourceEnum, CreateWorkflowDto } from '@novu/shared';

type WorkflowTemplateModalProps = ComponentProps<typeof DialogTrigger>;

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'popular' | 'events' | 'authentication' | 'social';
  workflowDefinition: CreateWorkflowDto;
}

const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'mention-notification',
    name: 'Mention in a comment',
    description: 'Triggered when an actor mentions someone',
    category: 'popular',
    workflowDefinition: {
      name: 'Mention in a comment',
      description: 'Triggered when an actor mentions someone',
      workflowId: 'mention-notification',
      steps: [
        {
          name: 'In-App Notification',
          type: StepTypeEnum.IN_APP,
          controlValues: {
            body: 'You were mentioned in a comment by {{payload.actorName}}',
            avatar: '',
            subject: 'New Mention',
            primaryAction: {
              label: 'View Comment',
              redirect: {
                url: '{{payload.commentUrl}}',
                target: '_blank',
              },
            },
            secondaryAction: null,
            redirect: {
              url: '',
              target: '_self',
            },
          },
        },
        {
          name: 'Email Notification',
          type: StepTypeEnum.EMAIL,
          controlValues: {
            subject: 'You were mentioned in a comment',
            body: JSON.stringify({
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  attrs: { textAlign: 'left' },
                  content: [
                    { type: 'text', text: 'Hi ' },
                    {
                      type: 'variable',
                      attrs: { id: 'subscriber.firstName', label: null, fallback: null, required: false },
                    },
                    { type: 'text', text: ',' },
                  ],
                },
                {
                  type: 'paragraph',
                  attrs: { textAlign: 'left' },
                  content: [
                    { type: 'text', text: 'You were mentioned in a comment by ' },
                    {
                      type: 'variable',
                      attrs: { id: 'payload.actorName', label: null, fallback: null, required: false },
                    },
                    { type: 'text', text: '.' },
                  ],
                },
                {
                  type: 'button',
                  attrs: {
                    text: 'View Comment',
                    isTextVariable: false,
                    url: '',
                    isUrlVariable: false,
                    alignment: 'left',
                    variant: 'filled',
                    borderRadius: 'smooth',
                    buttonColor: '#000000',
                    textColor: '#ffffff',
                    showIfKey: null,
                  },
                },
              ],
            }),
          },
        },
      ],
      tags: ['mention', 'comment', 'notification'],
      active: true,
      __source: WorkflowCreationSourceEnum.TEMPLATE_STORE,
    },
  },
];

export function WorkflowTemplateModal(props: WorkflowTemplateModalProps) {
  const form = useForm();
  const [selectedCategory, setSelectedCategory] = useState<string>('popular');

  const filteredTemplates = WORKFLOW_TEMPLATES.filter((template) => template.category === selectedCategory);

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
                <WorkflowSidebar selectedCategory={selectedCategory} onCategorySelect={setSelectedCategory} />
              </div>

              {/* Main Content */}
              <div className="w-full flex-1 p-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <h2 className="text-label-md text-strong">
                    {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} workflows
                  </h2>
                </div>

                <div className="grid grid-cols-3 gap-4 py-3 pt-3">
                  {filteredTemplates.map((template) => (
                    <CreateWorkflowButton key={template.id} asChild template={template.workflowDefinition}>
                      <WorkflowCard
                        name={template.name}
                        description={template.description}
                        steps={template.workflowDefinition.steps.map((step) => step.type)}
                      />
                    </CreateWorkflowButton>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex w-full items-center justify-end gap-2 border-t border-neutral-200 p-2">
              <CreateWorkflowButton asChild>
                <Button variant="outline" size="sm">
                  Create blank workflow
                </Button>
              </CreateWorkflowButton>
              <Button size="sm" variant="primary">
                Import template
                <RiArrowRightSLine className="size-4" />
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
