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
  type: z.enum([StepTypeEnum.EMAIL, StepTypeEnum.IN_APP, StepTypeEnum.SMS, StepTypeEnum.PUSH, StepTypeEnum.CHAT]),
  subject: z.string(),
  body: z.union([z.string(), emailContentSchema]),
});

const workflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum(['popular', 'events', 'authentication', 'social']),
  steps: z.array(stepSchema),
});

@Injectable()
export class GenerateSuggestionsUsecase {
  @InstrumentUsecase()
  async execute(command: GenerateSuggestionsCommand): Promise<{ suggestions: IWorkflowSuggestion[] }> {
    const result = await generateObject({
      model: openai('gpt-4o'),
      prompt: `You are an expert in generating workflow suggestions for a notification system. Based on the user's product description, generate 5 relevant workflow suggestions that would be useful for their product. Each workflow should be practical, specific, and follow best practices for user engagement and notification design.

      Consider common use cases for transactional notifications.

      For each workflow:
      - Create a unique ID
      - Give it a clear, descriptive name
      - Write a concise description of its purpose
      - Assign it to an appropriate category
      - Define practical steps with appropriate channels (email, SMS, push, in-app, chat)

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
          },
          {
            "type": "paragraph",
            "attrs": { "textAlign": "left" },
            "content": [
              { "type": "text", "text": "Your main message here with " },
              { "type": "variable", "attrs": { "id": "payload.dynamicValue", "fallback": null, "required": false } }
            ]
          },
          {
            "type": "button",
            "attrs": {
              "text": "Action Button",
              "url": "{{payload.actionUrl}}",
              "isTextVariable": false,
              "isUrlVariable": true,
              "alignment": "left",
              "variant": "filled",
              "borderRadius": "smooth",
              "buttonColor": "#000000",
              "textColor": "#ffffff"
            }
          }
        ]
      }

      Always include:
      - A personalized greeting with subscriber.firstName variable
      - Well-structured paragraphs with proper text alignment
      - Dynamic content using variables (subscriber.x or payload.x)
      - At least one action button with proper styling in emails
      - Clear hierarchy in the content
      - Proper liquid syntax for variables in non-email channels

      User's product description: ${command.prompt}`,
      schema: z.object({
        suggestions: z.array(workflowSchema),
      }),
      mode: 'json',
      experimental_providerMetadata: {
        config: {
          structuredOutputs: true,
        },
      },
    });

    // Transform the flattened result back into the expected structure
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
            controlValues: {
              subject: step.subject,
              body: step.type === StepTypeEnum.EMAIL ? JSON.stringify(step.body) : step.body,
            },
          })),
        },
      })) as any[],
    };
  }
}
