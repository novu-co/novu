import { Injectable } from '@nestjs/common';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { InstrumentUsecase } from '@novu/application-generic';
import { IWorkflowSuggestion } from '../../dtos/workflow-suggestion.interface';
import { GenerateSuggestionsCommand } from './generate-suggestions.command';
import { workflowSchema } from './schemas';
import { MULTIPLE_WORKFLOWS_PROMPT, SINGLE_WORKFLOW_PROMPT } from './prompts';
import { mapSuggestionToDto } from './mappers';

@Injectable()
export class GenerateSuggestionsUsecase {
  @InstrumentUsecase()
  async execute(command: GenerateSuggestionsCommand): Promise<{ suggestions: IWorkflowSuggestion[] }> {
    const schema =
      command.mode === 'single'
        ? z.object({ suggestions: z.array(workflowSchema).length(1) })
        : z.object({ suggestions: z.array(workflowSchema).min(5).max(5) });
    const result = await generateObject({
      model: openai('gpt-4o'),
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
  }
}
