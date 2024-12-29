import { Injectable } from '@nestjs/common';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { InstrumentUsecase } from '@novu/application-generic';
import { StepTypeEnum } from '@novu/shared';
import { IWorkflowSuggestion } from '../../dtos/workflow-suggestion.interface';
import { GenerateSuggestionsCommand } from './generate-suggestions.command';

const emailContentSchema = z.object({
  type: z.literal('doc'),
  content: z.array(
    z.object({
      type: z.union([z.literal('paragraph'), z.literal('button')]),
      attrs: z.record(z.any()),
      content: z
        .array(
          z.object({
            type: z.union([z.literal('text'), z.literal('variable')]),
            text: z.string().optional(),
            attrs: z.record(z.any()).optional(),
          })
        )
        .optional(),
    })
  ),
});

const stepSchema = z.object({
  name: z.string(),
  type: z.enum([
    StepTypeEnum.EMAIL,
    StepTypeEnum.IN_APP,
    StepTypeEnum.SMS,
    StepTypeEnum.PUSH,
    StepTypeEnum.CHAT,
    StepTypeEnum.DELAY,
  ]),
  subject: z.string().optional(),
  body: z.union([z.string(), emailContentSchema]).optional(),
  metadata: z
    .object({
      amount: z.number().optional(),
      unit: z.enum(['seconds', 'minutes', 'hours', 'days']).optional(),
      type: z.enum(['regular', 'scheduled']).optional(),
    })
    .optional(),
});

const workflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum(['popular', 'events', 'authentication', 'social']),
  steps: z.array(stepSchema),
});

const DELAY_EXAMPLES = `
Delay Step Examples:
1. Regular delay:
   {
     "type": "delay",
     "name": "Wait for 24 hours",
     "metadata": {
       "type": "regular",
       "amount": 24,
       "unit": "hours"
     }
   }

2. Scheduled delay:
   {
     "type": "delay",
     "name": "Wait until next day at 9am",
     "metadata": {
       "type": "scheduled",
       "amount": 9,
       "unit": "hours"
     }
   }`;

const MULTIPLE_WORKFLOWS_PROMPT = `You are an expert in generating workflow suggestions for a notification system. Based on the user's product description, generate 5 relevant workflow suggestions that would be useful for their product. Each workflow should be practical, specific, and follow best practices for user engagement and notification design.

Consider common use cases for transactional notifications.

For each workflow:
- Create a unique ID
- Give it a clear, descriptive name
- Write a concise description of its purpose
- Assign it to an appropriate category
- Define practical steps with appropriate channels (email, SMS, push, in-app, chat)
- Use delay steps when appropriate for better timing and user experience

Variable Usage Rules:
- For SMS, Push, In-App, and Chat channels: Use liquid syntax with either subscriber or payload prefix
  Examples: 
  - {{subscriber.firstName}}
  - {{payload.orderNumber}}
  - {{subscriber.email}}
  - {{payload.amount}}

For email steps, structure the body as a Tiptap JSON document with this format:
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "attrs": { "textAlign": "left" },
      "content": [
        { "type": "text", "text": "Hi " },
        { "type": "variable", "attrs": { "id": "subscriber.firstName", "fallback": null, "required": false } },
        { "type": "text", "text": "," }
      ]
    }
  ]
}

${DELAY_EXAMPLES}

Always include:
- A personalized greeting with subscriber.firstName variable
- Well-structured paragraphs with proper text alignment
- Dynamic content using variables (subscriber.x or payload.x)
- At least one action button with proper styling in emails
- Clear hierarchy in the content
- Proper liquid syntax for variables in non-email channels
- Appropriate delays between notifications when needed`;

const SINGLE_WORKFLOW_PROMPT = `You are an expert in creating notification workflows. Based on the user's workflow description, create a single, well-structured workflow that precisely matches their requirements. The workflow should follow best practices for user engagement and notification design.

For the workflow:
- Create a unique ID
- Give it a clear, descriptive name that reflects its purpose
- Write a concise description explaining what it does
- Assign it to the most appropriate category
- Define the exact steps with appropriate channels as specified (email, SMS, push, in-app, chat)
- Use delay steps for proper timing between notifications
- Handle edge cases and conditions appropriately

Variable Usage Rules:
- For SMS, Push, In-App, and Chat channels: Use liquid syntax with either subscriber or payload prefix
  Examples: 
  - {{subscriber.firstName}}
  - {{payload.orderNumber}}
  - {{subscriber.email}}
  - {{payload.amount}}

For email steps, structure the body as a Tiptap JSON document with this format:
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "attrs": { "textAlign": "left" },
      "content": [
        { "type": "text", "text": "Hi " },
        { "type": "variable", "attrs": { "id": "subscriber.firstName", "fallback": null, "required": false } },
        { "type": "text", "text": "," }
      ]
    }
  ]
}

${DELAY_EXAMPLES}

Always include:
- A personalized greeting with subscriber.firstName variable
- Well-structured paragraphs with proper text alignment
- Dynamic content using variables (subscriber.x or payload.x)
- At least one action button with proper styling in emails
- Clear hierarchy in the content
- Proper liquid syntax for variables in non-email channels
- Precise timing using delay steps when specified

Focus on creating a precise, production-ready workflow that exactly matches the user's requirements, including any timing or delay specifications.`;

@Injectable()
export class GenerateSuggestionsUsecase {
  @InstrumentUsecase()
  async execute(command: GenerateSuggestionsCommand): Promise<{ suggestions: IWorkflowSuggestion[] }> {
    const result = await generateObject({
      model: openai('gpt-4o'),
      prompt: `${command.mode === 'single' ? SINGLE_WORKFLOW_PROMPT : MULTIPLE_WORKFLOWS_PROMPT}

User's request: ${command.prompt}`,
      schema:
        command.mode === 'single'
          ? z.object({
              suggestions: z.array(workflowSchema).length(1),
            })
          : z.object({
              suggestions: z.array(workflowSchema).min(5).max(5),
            }),
      mode: 'json',
      experimental_providerMetadata: {
        config: {
          structuredOutputs: true,
        },
      },
    });

    return {
      suggestions: result.object.suggestions.map((suggestion) => ({
        id: suggestion.id,
        name: suggestion.name,
        description: suggestion.description,
        category: suggestion.category,
        workflowDefinition: {
          name: suggestion.name,
          description: suggestion.description,
          workflowId: suggestion.id,
          steps: suggestion.steps.map((step) => ({
            name: step.name,
            type: step.type,
            controlValues:
              step.type === StepTypeEnum.DELAY
                ? {
                    amount: step.metadata?.amount,
                    unit: step.metadata?.unit,
                    type: step.metadata?.type || 'regular',
                  }
                : {
                    subject: step.subject,
                    body: step.type === StepTypeEnum.EMAIL ? JSON.stringify(step.body) : step.body,
                  },
          })),
        },
      })) as any[],
    };
  }
}
