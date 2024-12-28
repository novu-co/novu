import { ComponentProps, useState } from 'react';
import { RiArrowRightSLine } from 'react-icons/ri';
import { BiCodeAlt } from 'react-icons/bi';
import { BsLightning } from 'react-icons/bs';
import { FiLock } from 'react-icons/fi';
import { HiOutlineUsers } from 'react-icons/hi';

import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/components/primitives/dialog';
import { Button } from '@/components/primitives/button';
import { CreateWorkflowButton } from '../create-workflow-button';
import { WorkflowCard, StepType } from './workflow-card';
import { WorkflowSidebar } from './workflow-sidebar';
import { RouteFill } from '../icons';
import { Form } from '../primitives/form/form';
import { useForm } from 'react-hook-form';
import { StepTypeEnum, WorkflowCreationSourceEnum } from '@novu/shared';

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
  steps: {
    name: string;
    type: StepTypeEnum;
    controlValues?: Record<string, unknown> | null;
  }[];
  category: 'popular' | 'events' | 'authentication' | 'social';
  tags: string[];
  active?: boolean;
  workflowId: string;
  __source: WorkflowCreationSourceEnum;
}

type WorkflowTemplateModalProps = ComponentProps<typeof DialogTrigger>;

const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'mention-notification',
    name: 'Mention in a comment',
    description: 'Triggered when an actor mentions someone',
    workflowId: 'mention-notification',
    steps: [
      {
        name: 'In-App Notification',
        type: StepTypeEnum.IN_APP,
        controlValues: {
          content: 'You were mentioned in a comment by {{actorName}}',
          title: 'New Mention',
          ctaLabel: 'View Comment',
        },
      },
      {
        name: 'Email Notification',
        type: StepTypeEnum.EMAIL,
        controlValues: {
          subject: 'You were mentioned in a comment',
          content: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Hi ',
                  },
                  {
                    type: 'variable',
                    attrs: { value: 'subscriberFirstName' },
                  },
                  {
                    type: 'text',
                    text: ',',
                  },
                ],
              },
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'You were mentioned in a comment by ',
                  },
                  {
                    type: 'variable',
                    attrs: { value: 'actorName' },
                  },
                  {
                    type: 'text',
                    text: '.',
                  },
                ],
              },
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Click the button below to view the comment:',
                  },
                ],
              },
              {
                type: 'button',
                attrs: {
                  url: '{{commentUrl}}',
                  text: 'View Comment',
                },
              },
            ],
          },
        },
      },
      {
        name: 'SMS Alert',
        type: StepTypeEnum.SMS,
        controlValues: {
          content: 'You were mentioned in a comment by {{actorName}}. Click {{commentUrl}} to view.',
        },
      },
      {
        name: 'Push Notification',
        type: StepTypeEnum.PUSH,
        controlValues: {
          title: 'New Mention',
          content: 'You were mentioned in a comment by {{actorName}}',
          data: {
            url: '{{commentUrl}}',
          },
        },
      },
    ],
    category: 'popular',
    tags: ['mention', 'comment', 'notification'],
    active: true,
    __source: WorkflowCreationSourceEnum.TEMPLATE_STORE,
  },
  {
    id: 'event-notification',
    name: 'New Event Notification',
    description: 'Notify users about new events',
    workflowId: 'event-notification',
    steps: [
      {
        name: 'In-App Notification',
        type: StepTypeEnum.IN_APP,
        controlValues: {
          content: 'New event: {{eventName}} on {{eventDate}}',
          title: 'New Event',
          ctaLabel: 'View Event',
        },
      },
      {
        name: 'Email Notification',
        type: StepTypeEnum.EMAIL,
        controlValues: {
          subject: 'New Event: {{eventName}}',
          content: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Hello ',
                  },
                  {
                    type: 'variable',
                    attrs: { value: 'subscriberFirstName' },
                  },
                  {
                    type: 'text',
                    text: ',',
                  },
                ],
              },
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'A new event has been scheduled: ',
                  },
                  {
                    type: 'variable',
                    attrs: { value: 'eventName' },
                  },
                ],
              },
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Date: ',
                  },
                  {
                    type: 'variable',
                    attrs: { value: 'eventDate' },
                  },
                ],
              },
              {
                type: 'button',
                attrs: {
                  url: '{{eventUrl}}',
                  text: 'View Event Details',
                },
              },
            ],
          },
        },
      },
    ],
    category: 'events',
    tags: ['event', 'notification'],
    active: true,
    __source: WorkflowCreationSourceEnum.TEMPLATE_STORE,
  },
  {
    id: 'password-reset',
    name: 'Password Reset',
    description: 'Send password reset instructions',
    workflowId: 'password-reset',
    steps: [
      {
        name: 'Email Instructions',
        type: StepTypeEnum.EMAIL,
        controlValues: {
          subject: 'Reset Your Password',
          content: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Hi ',
                  },
                  {
                    type: 'variable',
                    attrs: { value: 'subscriberFirstName' },
                  },
                  {
                    type: 'text',
                    text: ',',
                  },
                ],
              },
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'We received a request to reset your password. Click the button below to reset it:',
                  },
                ],
              },
              {
                type: 'button',
                attrs: {
                  url: '{{resetUrl}}',
                  text: 'Reset Password',
                },
              },
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'If you did not request this change, please ignore this email.',
                  },
                ],
              },
            ],
          },
        },
      },
      {
        name: 'SMS Code',
        type: StepTypeEnum.SMS,
        controlValues: {
          content: 'Your password reset code is: {{resetCode}}. This code will expire in 10 minutes.',
        },
      },
    ],
    category: 'authentication',
    tags: ['auth', 'password', 'security'],
    active: true,
    __source: WorkflowCreationSourceEnum.TEMPLATE_STORE,
  },
  {
    id: 'new-follower',
    name: 'New Follower',
    description: 'Notify user when they get a new follower',
    workflowId: 'new-follower',
    steps: [
      {
        name: 'In-App Alert',
        type: StepTypeEnum.IN_APP,
        controlValues: {
          content: '{{followerName}} started following you',
          title: 'New Follower',
          ctaLabel: 'View Profile',
        },
      },
      {
        name: 'Push Notification',
        type: StepTypeEnum.PUSH,
        controlValues: {
          title: 'New Follower',
          content: '{{followerName}} started following you',
          data: {
            url: '{{followerProfileUrl}}',
          },
        },
      },
    ],
    category: 'social',
    tags: ['social', 'follower', 'notification'],
    active: true,
    __source: WorkflowCreationSourceEnum.TEMPLATE_STORE,
  },
  {
    id: 'welcome-message',
    name: 'Welcome Message',
    description: 'Send welcome message to new users',
    workflowId: 'welcome-message',
    steps: [
      {
        name: 'Welcome Email',
        type: StepTypeEnum.EMAIL,
        controlValues: {
          subject: 'Welcome to Our Platform!',
          content: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Welcome ',
                  },
                  {
                    type: 'variable',
                    attrs: { value: 'subscriberFirstName' },
                  },
                  {
                    type: 'text',
                    text: '!',
                  },
                ],
              },
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'We are excited to have you on board. Here are some resources to help you get started:',
                  },
                ],
              },
              {
                type: 'bulletList',
                content: [
                  {
                    type: 'listItem',
                    content: [
                      {
                        type: 'paragraph',
                        content: [
                          {
                            type: 'text',
                            text: 'Quick Start Guide',
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'listItem',
                    content: [
                      {
                        type: 'paragraph',
                        content: [
                          {
                            type: 'text',
                            text: 'Documentation',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                type: 'button',
                attrs: {
                  url: '{{dashboardUrl}}',
                  text: 'Go to Dashboard',
                },
              },
            ],
          },
        },
      },
      {
        name: 'Welcome Notification',
        type: StepTypeEnum.IN_APP,
        controlValues: {
          content: 'Welcome to our platform! Click here to get started.',
          title: 'Welcome!',
          ctaLabel: 'Get Started',
        },
      },
    ],
    category: 'popular',
    tags: ['onboarding', 'welcome'],
    active: true,
    __source: WorkflowCreationSourceEnum.TEMPLATE_STORE,
  },
  {
    id: 'event-reminder',
    name: 'Event Reminder',
    description: 'Send event reminders to participants',
    workflowId: 'event-reminder',
    steps: [
      {
        name: 'Email Reminder',
        type: StepTypeEnum.EMAIL,
        controlValues: {
          subject: 'Reminder: {{eventName}} starts in 24 hours',
          content: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Hi ',
                  },
                  {
                    type: 'variable',
                    attrs: { value: 'subscriberFirstName' },
                  },
                  {
                    type: 'text',
                    text: ',',
                  },
                ],
              },
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'This is a reminder that ',
                  },
                  {
                    type: 'variable',
                    attrs: { value: 'eventName' },
                  },
                  {
                    type: 'text',
                    text: ' starts in 24 hours.',
                  },
                ],
              },
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Event details:',
                  },
                ],
              },
              {
                type: 'bulletList',
                content: [
                  {
                    type: 'listItem',
                    content: [
                      {
                        type: 'paragraph',
                        content: [
                          {
                            type: 'text',
                            text: 'Date: ',
                          },
                          {
                            type: 'variable',
                            attrs: { value: 'eventDate' },
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'listItem',
                    content: [
                      {
                        type: 'paragraph',
                        content: [
                          {
                            type: 'text',
                            text: 'Location: ',
                          },
                          {
                            type: 'variable',
                            attrs: { value: 'eventLocation' },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                type: 'button',
                attrs: {
                  url: '{{eventUrl}}',
                  text: 'View Event Details',
                },
              },
            ],
          },
        },
      },
      {
        name: 'SMS Reminder',
        type: StepTypeEnum.SMS,
        controlValues: {
          content: 'Reminder: {{eventName}} starts in 24 hours at {{eventLocation}}. Details: {{eventUrl}}',
        },
      },
    ],
    category: 'events',
    tags: ['event', 'reminder'],
    active: true,
    __source: WorkflowCreationSourceEnum.TEMPLATE_STORE,
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
                    <CreateWorkflowButton key={template.id} asChild>
                      <WorkflowCard
                        name={template.name}
                        description={template.description}
                        steps={template.steps.map((step) => step.type as StepType)}
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
