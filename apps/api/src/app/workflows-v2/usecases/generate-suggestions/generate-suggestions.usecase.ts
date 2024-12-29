import { Injectable, Logger } from '@nestjs/common';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { InstrumentUsecase } from '@novu/application-generic';
import { IWorkflowSuggestion } from '../../dtos/workflow-suggestion.interface';
import { GenerateSuggestionsCommand } from './generate-suggestions.command';
import { workflowSchema } from './schemas';
import { MULTIPLE_WORKFLOWS_PROMPT, SINGLE_WORKFLOW_PROMPT } from './prompts';
import { mapSuggestionToDto } from './mappers';
import { withRetry } from './retry.util';

@Injectable()
export class GenerateSuggestionsUsecase {
  private readonly logger = new Logger(GenerateSuggestionsUsecase.name);

  @InstrumentUsecase()
  async execute(command: GenerateSuggestionsCommand): Promise<{ suggestions: IWorkflowSuggestion[] }> {
    const schema =
      command.mode === 'single'
        ? z.object({ suggestions: z.array(workflowSchema).length(1) })
        : z.object({ suggestions: z.array(workflowSchema).min(5).max(5) });

    return withRetry(
      async () => {
        const result = await generateObject({
          model: openai('gpt-4o', {
            structuredOutputs: true,
          }),
          prompt: `${command.mode === 'single' ? SINGLE_WORKFLOW_PROMPT : MULTIPLE_WORKFLOWS_PROMPT}

User's request: ${command.prompt}`,
          schema,
          mode: 'json',
          experimental_providerMetadata: {
            config: {
              structuredOutputs: true,
            },
          },
        });

        return {
          suggestions: result.object.suggestions.map(mapSuggestionToDto),
        };
      },
      {
        isRetryable: (error) => {
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
        },
        onRetry: (error, attempt, delay) => {
          this.logger.warn(`Retrying workflow suggestion generation after ${delay}ms (attempt ${attempt})`, {
            error,
            command,
          });
        },
      }
    );
  }
}
