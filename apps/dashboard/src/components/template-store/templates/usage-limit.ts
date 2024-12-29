import { StepTypeEnum, WorkflowCreationSourceEnum } from '@novu/shared';
import { WorkflowTemplate } from './types';

export const usageLimitTemplate: WorkflowTemplate = {
  id: 'usage-limit',
  name: 'Usage limit alert',
  description: 'Alert users when they approach their usage limits',
  category: 'events',
  isPopular: true,
  workflowDefinition: {
    name: 'Usage limit alert',
    description: 'Alert users when they approach their usage limits',
    workflowId: 'usage-limit',
    steps: [
      {
        name: 'Email Alert',
        type: StepTypeEnum.EMAIL,
        controlValues: {
          subject: 'Approaching usage limit for {{payload.resourceName}}',
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
                  { type: 'text', text: 'Your ' },
                  {
                    type: 'variable',
                    attrs: { id: 'payload.resourceName', label: null, fallback: 'resource', required: false },
                  },
                  { type: 'text', text: ' usage has reached ' },
                  {
                    type: 'variable',
                    attrs: { id: 'payload.currentUsage', label: null, fallback: null, required: true },
                  },
                  { type: 'text', text: ' of your ' },
                  {
                    type: 'variable',
                    attrs: { id: 'payload.limit', label: null, fallback: null, required: true },
                  },
                  { type: 'text', text: ' limit.' },
                ],
              },
              {
                type: 'paragraph',
                attrs: { textAlign: 'left' },
                content: [{ type: 'text', text: 'Current Usage Details:' }],
              },
              {
                type: 'bulletList',
                content: [
                  {
                    type: 'listItem',
                    content: [
                      {
                        type: 'paragraph',
                        attrs: { textAlign: 'left' },
                        content: [
                          { type: 'text', text: 'Used: ' },
                          {
                            type: 'variable',
                            attrs: { id: 'payload.currentUsage', label: null, fallback: null, required: true },
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
                        attrs: { textAlign: 'left' },
                        content: [
                          { type: 'text', text: 'Remaining: ' },
                          {
                            type: 'variable',
                            attrs: { id: 'payload.remaining', label: null, fallback: null, required: true },
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
                        attrs: { textAlign: 'left' },
                        content: [
                          { type: 'text', text: 'Reset Date: ' },
                          {
                            type: 'variable',
                            attrs: {
                              id: 'payload.resetDate',
                              label: null,
                              fallback: 'End of billing period',
                              required: false,
                            },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                type: 'paragraph',
                attrs: { textAlign: 'left' },
                content: [{ type: 'text', text: 'To avoid any service interruptions, consider upgrading your plan.' }],
              },
              {
                type: 'button',
                attrs: {
                  text: 'Upgrade Plan',
                  isTextVariable: false,
                  url: '{{payload.upgradeUrl}}',
                  isUrlVariable: true,
                  alignment: 'left',
                  variant: 'filled',
                  borderRadius: 'smooth',
                  buttonColor: '#0047FF',
                  textColor: '#ffffff',
                  showIfKey: null,
                },
              },
            ],
          }),
        },
      },
      {
        name: 'In-App Alert',
        type: StepTypeEnum.IN_APP,
        controlValues: {
          subject: 'Approaching {{payload.resourceName}} limit',
          body: 'You have used {{payload.currentUsage}} of {{payload.limit}} {{payload.resourceName}}. Consider upgrading your plan.',
          action: {
            status: 'warning',
            buttons: [
              {
                content: 'View Usage',
                buttonColor: '#0047FF',
                textColor: '#ffffff',
              },
            ],
          },
        },
      },
    ],
    tags: ['usage', 'limits', 'billing'],
    active: true,
    __source: WorkflowCreationSourceEnum.TEMPLATE_STORE,
  },
};
