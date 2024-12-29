import { WorkflowMode } from '../types';
import { CreateWorkflowButton } from '../../create-workflow-button';
import { WorkflowCard } from '../workflow-card';
import { IWorkflowSuggestion } from '../templates/types';

type WorkflowResultsProps = {
  mode: WorkflowMode;
  suggestions: IWorkflowSuggestion[];
};

export function WorkflowResults({ mode, suggestions }: WorkflowResultsProps) {
  return (
    <div
      className={`grid ${
        mode === WorkflowMode.FROM_PROMPT ? 'mx-auto w-full max-w-xl grid-cols-1' : 'grid-cols-3'
      } gap-4`}
    >
      {suggestions.map((template) => {
        return (
          <CreateWorkflowButton key={template.name} asChild template={template.workflowDefinition}>
            <WorkflowCard
              name={template.name}
              template={template.workflowDefinition}
              description={template.description || ''}
              steps={template.workflowDefinition.steps.map((step) => step.type)}
            />
          </CreateWorkflowButton>
        );
      })}
    </div>
  );
}
