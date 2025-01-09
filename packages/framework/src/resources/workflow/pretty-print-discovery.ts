import type { DiscoverWorkflowOutput } from '../../types';
import { log } from '../../utils';

export function prettyPrintDiscovery(discoveredWorkflow: DiscoverWorkflowOutput): void {
  log((l) => `\n${l.bold(l.underline('Discovered workflowId:'))} '${discoveredWorkflow.workflowId}'`);
  discoveredWorkflow.steps.forEach((step, i) => {
    const isLastStep = i === discoveredWorkflow.steps.length - 1;
    const prefix = isLastStep ? '└' : '├';
    log((l) => `${prefix} ${l.emoji.STEP} Discovered stepId: '${step.stepId}'\tType: '${step.type}'`);
    step.providers.forEach((provider, providerIndex) => {
      const isLastProvider = providerIndex === step.providers.length - 1;
      const stepPrefix = isLastStep ? ' ' : '│';
      const providerPrefix = isLastProvider ? '└' : '├';
      log((l) => `${stepPrefix} ${providerPrefix} ${l.emoji.PROVIDER} Discovered provider: '${provider.type}'`);
    });
  });
}
