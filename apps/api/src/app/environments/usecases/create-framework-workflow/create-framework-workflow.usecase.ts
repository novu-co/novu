import { Injectable, NotFoundException } from '@nestjs/common';
import { Step, Workflow, workflow, WorkflowChannelEnum } from '@novu/framework';
import { NotificationTemplateRepository, NotificationTemplateEntity } from '@novu/dal';
import { StepTypeEnum } from '@novu/shared';
import { CreateFrameworkWorkflowCommand } from './create-framework-workflow.command';

// Unfortunately we need this mapper because the `in_app` step type uses `step.inApp()` in Framework.
const stepFnFromStepType: Record<Exclude<StepTypeEnum, StepTypeEnum.CUSTOM | StepTypeEnum.TRIGGER>, keyof Step> = {
  [StepTypeEnum.IN_APP]: WorkflowChannelEnum.IN_APP,
  [StepTypeEnum.EMAIL]: WorkflowChannelEnum.EMAIL,
  [StepTypeEnum.SMS]: WorkflowChannelEnum.SMS,
  [StepTypeEnum.CHAT]: WorkflowChannelEnum.CHAT,
  [StepTypeEnum.PUSH]: WorkflowChannelEnum.PUSH,
  [StepTypeEnum.DIGEST]: StepTypeEnum.DIGEST,
  [StepTypeEnum.DELAY]: StepTypeEnum.DELAY,
};

@Injectable()
export class CreateFrameworkWorkflow {
  constructor(private workflowsRepository: NotificationTemplateRepository) {}

  async execute(command: CreateFrameworkWorkflowCommand): Promise<Workflow> {
    const dbWorkflow = await this.getDbWorkflow(command.environmentId, command.workflowId);

    return this.createFrameworkWorkflow(dbWorkflow, command.controlValues);
  }

  private async getDbWorkflow(environmentId: string, workflowId: string): Promise<NotificationTemplateEntity> {
    const foundWorkflow = await this.workflowsRepository.findByTriggerIdentifier(environmentId, workflowId);

    if (!foundWorkflow) {
      throw new NotFoundException(`Workflow ${workflowId} not found`);
    }

    return foundWorkflow;
  }

  private createFrameworkWorkflow(
    newWorkflow: NotificationTemplateEntity,
    controlValues: Record<string, unknown>
  ): Workflow {
    return workflow(
      newWorkflow.name,
      async ({ step }) => {
        for await (const staticStep of newWorkflow.steps) {
          const stepTemplate = staticStep.template;

          if (!stepTemplate) {
            throw new NotFoundException(`Step template not found for step ${staticStep.stepId}`);
          }

          const stepType = stepTemplate.type;
          const stepFn = stepFnFromStepType[stepType];
          const stepControls = stepTemplate.controls;

          if (!stepControls) {
            throw new NotFoundException(`Step controls not found for step ${staticStep.stepId}`);
          }

          await step[stepFn](staticStep.stepId, () => controlValues, {
            controlSchema: stepControls.schema,
            /*
             * TODO: add conditions
             * Used to construct conditions defined with https://react-querybuilder.js.org/ or similar
             */
            skip: () => false,
          });
        }
      },
      {
        /*
         * TODO: Workflow options are not needed currently, given that this endpoint
         * focuses on execution only. However we should reconsider if we decide to
         * expose Workflow options to the `workflow` function.
         *
         * preferences: foundWorkflow.preferences,
         * tags: foundWorkflow.tags,
         */
      }
    );
  }
}
