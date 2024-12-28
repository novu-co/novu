import { ComponentProps } from 'react';
import { RiArrowRightSLine, RiSearchLine } from 'react-icons/ri';
import { BiCodeAlt } from 'react-icons/bi';
import { BsLightning } from 'react-icons/bs';
import { FiLock } from 'react-icons/fi';
import { HiOutlineUsers } from 'react-icons/hi';

import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/components/primitives/dialog';
import { Input, InputField } from '@/components/primitives/input';
import { Button } from '@/components/primitives/button';
import { CreateWorkflowButton } from '../create-workflow-button';
import { WorkflowCard, StepType } from './workflow-card';
import { WorkflowSidebar } from './workflow-sidebar';
import { RouteFill } from '../icons';
import { Form } from '../primitives/form/form';
import { useForm } from 'react-hook-form';

const CATEGORIES = [
  {
    id: 'popular',
    name: 'Popular',
    icon: BsLightning,
  },
  {
    id: 'events',
    name: 'Events',
    icon: HiOutlineUsers,
  },
  {
    id: 'authentication',
    name: 'Authentication',
    icon: FiLock,
  },
  {
    id: 'social',
    name: 'Social',
    icon: HiOutlineUsers,
  },
] as const;

const CREATE_OPTIONS = [
  {
    id: 'code-based',
    name: 'Code-based workflow',
    icon: BiCodeAlt,
  },
  {
    id: 'blank',
    name: 'Blank workflow',
    icon: BsLightning,
  },
] as const;

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  steps: StepType[];
}

const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'mention-comment-1',
    name: 'Mention in a comment',
    description: 'Triggered when an actor mentions someone',
    steps: ['In-App', 'Email', 'SMS', 'Push'],
  },
  {
    id: 'mention-comment-2',
    name: 'Mention in a comment',
    description: 'Triggered when an actor mentions someone',
    steps: ['In-App', 'Email', 'SMS', 'Push'],
  },
  {
    id: 'mention-comment-3',
    name: 'Mention in a comment',
    description: 'Triggered when an actor mentions someone',
    steps: ['In-App', 'Email', 'SMS', 'Push'],
  },
  {
    id: 'mention-comment-4',
    name: 'Mention in a comment',
    description: 'Triggered when an actor mentions someone',
    steps: ['In-App', 'Email', 'SMS', 'Push'],
  },
  {
    id: 'mention-comment-5',
    name: 'Mention in a comment',
    description: 'Triggered when an actor mentions someone',
    steps: ['In-App', 'Email', 'SMS', 'Push'],
  },
  {
    id: 'mention-comment-6',
    name: 'Mention in a comment',
    description: 'Triggered when an actor mentions someone',
    steps: ['In-App', 'Email', 'SMS', 'Push'],
  },
];

type WorkflowTemplateModalProps = ComponentProps<typeof DialogTrigger>;

export function WorkflowTemplateModal(props: WorkflowTemplateModalProps) {
  const form = useForm();

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
                <WorkflowSidebar />
              </div>

              {/* Main Content */}
              <div className="w-full flex-1 p-3 py-1.5">
                <div className="flex items-center justify-between border-b border-neutral-200">
                  <h2 className="text-label-md text-strong">Popular workflows</h2>
                  <div className="relative">
                    <InputField>
                      <RiSearchLine className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
                      <Input className="w-[300px] pl-9" placeholder="Search templates" />
                    </InputField>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 p-6">
                  {WORKFLOW_TEMPLATES.map((template) => (
                    <CreateWorkflowButton key={template.id} asChild>
                      <WorkflowCard name={template.name} description={template.description} steps={template.steps} />
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
              <Button size="sm">
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
