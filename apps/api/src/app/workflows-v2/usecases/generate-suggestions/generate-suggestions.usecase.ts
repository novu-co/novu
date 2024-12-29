import { Injectable, Logger } from '@nestjs/common';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { InstrumentUsecase } from '@novu/application-generic';
import { StepTypeEnum } from '@novu/shared';
import { IWorkflowSuggestion } from '../../dtos/workflow-suggestion.interface';
import { GenerateSuggestionsCommand } from './generate-suggestions.command';
import { workflowSchema, emailContentSchema } from './schemas';
import {
  MULTIPLE_WORKFLOWS_PROMPT,
  SINGLE_WORKFLOW_PROMPT,
  EMAIL_CONTENT_PROMPT,
  IN_APP_CONTENT_PROMPT,
  PUSH_CONTENT_PROMPT,
  SMS_CONTENT_PROMPT,
  CHAT_CONTENT_PROMPT,
} from './prompts';
import { mapSuggestionToDto } from './mappers';
import { withRetry } from './retry.util';
import { IWorkflow, IWorkflowStep } from './types';

@Injectable()
export class GenerateSuggestionsUsecase {
  private readonly logger = new Logger(GenerateSuggestionsUsecase.name);

  @InstrumentUsecase()
  async execute(command: GenerateSuggestionsCommand): Promise<{ suggestions: IWorkflowSuggestion[] }> {
    // First, generate workflow structures
    const workflowsResult = await this.generateWorkflowStructures(command);

    // Then, enrich each workflow's steps with content
    const enrichedWorkflows = await this.enrichWorkflowsWithContent(workflowsResult.suggestions, command);

    return {
      suggestions: enrichedWorkflows.map(mapSuggestionToDto),
    };
  }

  private async generateWorkflowStructures(command: GenerateSuggestionsCommand) {
    return withRetry(
      async () => {
        const result = await generateObject({
          model: openai('gpt-4o', {
            structuredOutputs: true,
          }),
          prompt: `${command.mode === 'single' ? SINGLE_WORKFLOW_PROMPT : MULTIPLE_WORKFLOWS_PROMPT}

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
    const enrichedWorkflows: IWorkflow[] = [];

    for (const workflow of workflows) {
      const enrichedSteps: IWorkflowStep[] = [];

      for (const step of workflow.steps) {
        const enrichedStep: IWorkflowStep = { ...step };

        if (step.type === StepTypeEnum.EMAIL) {
          const email = await this.generateEmailContent(workflow, step, command);
          enrichedStep.body = JSON.stringify(email[0]);
        } else if (step.type === StepTypeEnum.IN_APP) {
          enrichedStep.body = await this.generateInAppContent(workflow, step, command);
        } else if (step.type === StepTypeEnum.PUSH) {
          enrichedStep.body = await this.generatePushContent(workflow, step, command);
        } else if (step.type === StepTypeEnum.SMS) {
          enrichedStep.body = await this.generateSmsContent(workflow, step, command);
        } else if (step.type === StepTypeEnum.CHAT) {
          enrichedStep.body = await this.generateChatContent(workflow, step, command);
        }

        enrichedSteps.push(enrichedStep);
      }

      enrichedWorkflows.push({
        ...workflow,
        steps: enrichedSteps,
      });
    }

    return enrichedWorkflows;
  }

  private async generateEmailContent(workflow: IWorkflow, step: IWorkflowStep, command: GenerateSuggestionsCommand) {
    const result = await withRetry(
      async () => {
        const response = await generateObject({
          model: openai('gpt-4o', {
            structuredOutputs: true,
          }),
          prompt: `${EMAIL_CONTENT_PROMPT}

Workflow Context:
Name: ${workflow.name}
Description: ${workflow.description}
Step Name: ${step.name}
Step Reasoning: ${step.context?.reasoning || ''}
Step Focus Points:
${step.context?.focus?.map((point) => `- ${point}`).join('\n') || ''}

User's request: ${command.prompt}`,
          schema: z.object({ content: z.array(emailContentSchema) }),
          mode: 'json',
          experimental_providerMetadata: {
            config: {
              structuredOutputs: true,
            },
          },
        });

        return response.object.content;
      },
      {
        isRetryable: this.isRetryableError,
        onRetry: (error, attempt, delay) => {
          this.logger.warn(`Retrying email content generation after ${delay}ms (attempt ${attempt})`, {
            error,
            workflow,
            step,
          });
        },
      }
    );

    return result;
  }

  private async generateTextContent(
    prompt: string,
    workflow: IWorkflow,
    step: IWorkflowStep,
    command: GenerateSuggestionsCommand
  ) {
    const result = await withRetry(
      async () => {
        const response = await generateObject({
          model: openai('gpt-4o', {
            structuredOutputs: true,
          }),
          prompt: `${prompt}

Workflow Context:
Name: ${workflow.name}
Description: ${workflow.description}
Step Name: ${step.name}
Step Reasoning: ${step.context?.reasoning || ''}
Step Focus Points:
${step.context?.focus?.map((point) => `- ${point}`).join('\n') || ''}

User's request: ${command.prompt}`,
          schema: z.object({
            text: z.string(),
          }),
          mode: 'json',
          experimental_providerMetadata: {
            config: {
              structuredOutputs: true,
            },
          },
        });

        return response.object.text;
      },
      {
        isRetryable: this.isRetryableError,
        onRetry: (error, attempt, delay) => {
          this.logger.warn(`Retrying text content generation after ${delay}ms (attempt ${attempt})`, {
            error,
            workflow,
            step,
          });
        },
      }
    );

    return result;
  }

  private generateInAppContent(workflow: IWorkflow, step: IWorkflowStep, command: GenerateSuggestionsCommand) {
    return this.generateTextContent(IN_APP_CONTENT_PROMPT, workflow, step, command);
  }

  private generatePushContent(workflow: IWorkflow, step: IWorkflowStep, command: GenerateSuggestionsCommand) {
    return this.generateTextContent(PUSH_CONTENT_PROMPT, workflow, step, command);
  }

  private generateSmsContent(workflow: IWorkflow, step: IWorkflowStep, command: GenerateSuggestionsCommand) {
    return this.generateTextContent(SMS_CONTENT_PROMPT, workflow, step, command);
  }

  private generateChatContent(workflow: IWorkflow, step: IWorkflowStep, command: GenerateSuggestionsCommand) {
    return this.generateTextContent(CHAT_CONTENT_PROMPT, workflow, step, command);
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
