import { Injectable } from '@nestjs/common';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { InstrumentUsecase } from '@novu/application-generic';
import { StepTypeEnum } from '@novu/shared';
import { IWorkflowSuggestion } from '../../dtos/workflow-suggestion.interface';
import { GenerateSuggestionsCommand } from './generate-suggestions.command';

const stepSchema = z.object({
  name: z.string(),
  type: z.enum([StepTypeEnum.EMAIL, StepTypeEnum.IN_APP, StepTypeEnum.SMS, StepTypeEnum.PUSH, StepTypeEnum.CHAT]),
  subject: z.string(),
  body: z.string(),
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
      model: openai('gpt-4o', {
        structuredOutputs: true,
      }),
      systemPrompt: `You are an expert in generating workflow suggestions for a notification system. Based on the user's product description, generate 5 relevant workflow suggestions that would be useful for their product. Each workflow should be practical, specific, and follow best practices for user engagement and notification design.

      Consider common use cases like:
      - User onboarding and authentication
      - Activity updates and engagement
      - System alerts and status changes
      - Social interactions and collaboration
      - Transactional notifications

      For each workflow:
      - Create a unique ID
      - Give it a clear, descriptive name
      - Write a concise description of its purpose
      - Assign it to an appropriate category
      - Define practical steps with appropriate channels (email, SMS, push, in-app, chat)
      - Include relevant subject lines and message content
      - Add action buttons where appropriate`,
      schemaName: 'workflow-suggestions',
      schemaDescription: "A list of workflow suggestions based on the user's product description.",
      schema: z.object({
        suggestions: z.array(workflowSchema),
      }),
      prompt: command.prompt,
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
              body: step.body,
            },
          })),
        },
      })) as any[],
    };
  }
}
