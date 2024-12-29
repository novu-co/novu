import { Injectable, Logger } from '@nestjs/common';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { InstrumentUsecase } from '@novu/application-generic';
import { StepTypeEnum } from '@novu/shared';
import { IWorkflowSuggestion } from '../../dtos/workflow-suggestion.interface';
import { GenerateSuggestionsCommand } from './generate-suggestions.command';
import { workflowSchema, emailContentSchema } from './schemas';
import { prompts } from './prompts';
import { mapSuggestionToDto } from './mappers';
import { withRetry } from './retry.util';
import { IWorkflow, IWorkflowStep } from './types';

type ContentGenerator = {
  prompt: string;
  schema: z.ZodType<any>;
  mapResult: (result: any) => string;
} | null;

@Injectable()
export class GenerateSuggestionsUsecase {
  private readonly logger = new Logger(GenerateSuggestionsUsecase.name);

  @InstrumentUsecase()
  async execute(command: GenerateSuggestionsCommand): Promise<{ suggestions: IWorkflowSuggestion[] }> {
    const workflowsResult = await this.generateWorkflowStructures(command);
    const enrichedWorkflows = await this.enrichWorkflowsWithContent(workflowsResult.suggestions, command);

    return {
      suggestions: enrichedWorkflows.map(mapSuggestionToDto),
    };
  }

  private readonly contentGenerators: Record<StepTypeEnum, ContentGenerator> = {
    [StepTypeEnum.EMAIL]: {
      prompt: prompts.email,
      schema: z.object({ content: z.array(emailContentSchema) }),
      mapResult: (result) => JSON.stringify(result.content[0]),
    },
    [StepTypeEnum.IN_APP]: {
      prompt: prompts.inApp,
      schema: z.object({ text: z.string() }),
      mapResult: (result) => result.text,
    },
    [StepTypeEnum.PUSH]: {
      prompt: prompts.push,
      schema: z.object({ text: z.string() }),
      mapResult: (result) => result.text,
    },
    [StepTypeEnum.SMS]: {
      prompt: prompts.sms,
      schema: z.object({ text: z.string() }),
      mapResult: (result) => result.text,
    },
    [StepTypeEnum.CHAT]: {
      prompt: prompts.chat,
      schema: z.object({ text: z.string() }),
      mapResult: (result) => result.text,
    },
    // Non-content steps return null
    [StepTypeEnum.DIGEST]: null,
    [StepTypeEnum.TRIGGER]: null,
    [StepTypeEnum.DELAY]: null,
    [StepTypeEnum.CUSTOM]: null,
  };

  private async generateWorkflowStructures(command: GenerateSuggestionsCommand) {
    const workflowPrompt = command.mode === 'single' ? prompts.singleWorkflow : prompts.multipleWorkflows;

    return withRetry(
      async () => {
        const result = await generateObject({
          model: openai('gpt-4o', {
            structuredOutputs: true,
          }),
          prompt: `${workflowPrompt}

User's request: ${command.prompt}`,
          schema: z.object({ suggestions: z.array(workflowSchema) }),
          mode: 'json',
          experimental_providerMetadata: {
            config: {
              structuredOutputs: true,
            },
          },
        });

        return result.object;
      },
      {
        isRetryable: this.isRetryableError,
        onRetry: (error, attempt, delay) => {
          this.logger.warn(`Retrying workflow structure generation after ${delay}ms (attempt ${attempt})`, {
            error,
            command,
          });
        },
      }
    );
  }

  private async enrichWorkflowsWithContent(workflows: IWorkflow[], command: GenerateSuggestionsCommand) {
    return Promise.all(
      workflows.map(async (workflow) => ({
        ...workflow,
        steps: await Promise.all(
          workflow.steps.map(async (step) => ({
            ...step,
            body: await this.generateStepContent(workflow, step, command),
          }))
        ),
      }))
    );
  }

  private async generateStepContent(workflow: IWorkflow, step: IWorkflowStep, command: GenerateSuggestionsCommand) {
    const generator = this.contentGenerators[step.type];
    if (!generator) return step.body;

    const result = await withRetry(
      async () => {
        const response = await generateObject({
          model: openai('gpt-4o', {
            structuredOutputs: true,
          }),
          prompt: this.buildContentPrompt(generator.prompt, workflow, step, command),
          schema: generator.schema,
          mode: 'json',
          experimental_providerMetadata: {
            config: {
              structuredOutputs: true,
            },
          },
        });

        return generator.mapResult(response.object);
      },
      {
        isRetryable: this.isRetryableError,
        onRetry: (error, attempt, delay) => {
          this.logger.warn(`Retrying ${step.type} content generation after ${delay}ms (attempt ${attempt})`, {
            error,
            workflow,
            step,
          });
        },
      }
    );

    return result;
  }

  private buildContentPrompt(
    basePrompt: string,
    workflow: IWorkflow,
    step: IWorkflowStep,
    command: GenerateSuggestionsCommand
  ): string {
    return `${basePrompt}

Workflow Context:
Name: ${workflow.name}
Description: ${workflow.description}
Step Name: ${step.name}
Step Reasoning: ${step.context?.reasoning || ''}
Step Focus Points:
${step.context?.focus?.map((point) => `- ${point}`).join('\n') || ''}

User's request: ${command.prompt}`;
  }

  private isRetryableError(error: any): boolean {
    // Zod validation errors (can be transient due to AI output variations)
    if (error instanceof z.ZodError) return true;

    // Rate limits
    if (error?.status === 429) return true;

    // Server errors
    if (error?.status >= 500 && error?.status < 600) return true;

    // Network errors
    if (error?.code === 'ECONNRESET' || error?.code === 'ETIMEDOUT') return true;

    // Specific OpenAI errors that are retryable
    const retryableMessages = ['capacity', 'server_error', 'rate_limit_exceeded', 'model_overloaded'];

    return retryableMessages.some((msg) => error?.message?.toLowerCase().includes(msg));
  }
}
