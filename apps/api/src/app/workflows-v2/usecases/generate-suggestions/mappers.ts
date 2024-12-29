import { StepTypeEnum, WorkflowCreationSourceEnum } from '@novu/shared';
import { IWorkflowSuggestion } from '../../dtos/workflow-suggestion.interface';

interface IWorkflowStep {
  name: string;
  type: StepTypeEnum;
  subject?: string;
  body?: string;
  content?: Array<{
    type: 'text' | 'variable' | 'paragraph' | 'button';
    text: string;
  }>;
  metadata?: {
    amount?: number;
    unit?: 'seconds' | 'minutes' | 'hours' | 'days';
    type?: 'regular' | 'scheduled';
  };
}

interface IGeneratedWorkflow {
  id: string;
  name: string;
  description: string;
  category: 'popular' | 'events' | 'authentication' | 'social';
  steps: IWorkflowStep[];
}

function convertEmailContentToTipTap(content: Array<{ type: string; text: string }>) {
  // Each content item becomes its own block (except buttons)
  const blocks = content.map((item) => {
    if (item.type === 'button') {
      return {
        type: 'button',
        attrs: {
          textAlign: 'left',
          text: item.text || 'Button',
          isTextVariable: false,
          url: '',
          isUrlVariable: false,
          alignment: 'left',
          variant: 'filled',
          borderRadius: 'smooth',
          buttonColor: '#000000',
          textColor: '#ffffff',
          showIfKey: null,
        },
        content: [],
      };
    }

    // For text and variables, create a paragraph block with single content item
    const contentItem =
      item.type === 'variable'
        ? {
            type: 'variable' as const,
            attrs: {
              id: item.text,
              label: null,
              fallback: null,
              required: false,
            },
          }
        : {
            type: 'text' as const,
            text: item.text,
          };

    return {
      type: 'paragraph',
      attrs: { textAlign: 'left' },
      content: [contentItem],
    };
  });

  // Filter out any potentially empty blocks
  const nonEmptyBlocks = blocks.filter(
    (block) => block.type === 'button' || (block.content && block.content.length > 0)
  );

  // Ensure we have at least one block
  if (nonEmptyBlocks.length === 0) {
    nonEmptyBlocks.push({
      type: 'paragraph',
      attrs: { textAlign: 'left' },
      content: [],
    });
  }

  return {
    type: 'doc',
    content: nonEmptyBlocks,
  };
}

export function mapSuggestionToDto(suggestion: IGeneratedWorkflow): IWorkflowSuggestion {
  const { id, name, description, category, steps } = suggestion;

  return {
    id,
    name,
    description,
    category,
    workflowDefinition: {
      name,
      description,
      workflowId: id,
      __source: WorkflowCreationSourceEnum.TEMPLATE_STORE,
      steps: steps.map(mapStepToDto),
    },
  };
}

function mapStepToDto(step: IWorkflowStep) {
  return {
    name: step.name,
    type: step.type,
    controlValues: step.type === StepTypeEnum.DELAY ? mapDelayStep(step) : mapContentStep(step),
  };
}

function mapDelayStep(step: IWorkflowStep) {
  return {
    amount: step.metadata?.amount,
    unit: step.metadata?.unit,
    type: step.metadata?.type || 'regular',
  };
}

function mapContentStep(step: IWorkflowStep) {
  if (step.type === StepTypeEnum.EMAIL && step.content) {
    return {
      subject: step.subject,
      body: JSON.stringify(convertEmailContentToTipTap(step.content)),
    };
  }

  return {
    subject: step.subject,
    body: step.body,
  };
}
