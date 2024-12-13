import { UiSchemaGroupEnum } from '@novu/shared';
import { getComponentByType } from '@/components/workflow-editor/steps/component-utils';
import { useWorkflow } from '@/components/workflow-editor/workflow-provider';
import { Separator } from '@/components/primitives/separator';
import { SidebarContent } from '@/components/side-navigation/sidebar';
import { CustomStepControls } from '../controls/custom-step-controls';

export const DigestControlValues = () => {
  const { step, workflow } = useWorkflow();
  const { uiSchema, dataSchema } = step?.controls ?? {};

  if (dataSchema && workflow) {
    return (
      <div>
        <CustomStepControls dataSchema={dataSchema} origin={workflow.origin} />
      </div>
    );
  }

  if (!uiSchema || uiSchema?.group !== UiSchemaGroupEnum.DIGEST) {
    return null;
  }

  const { ['amount']: amount, ['digestKey']: digestKey, ['unit']: unit, ['cron']: cron } = uiSchema.properties ?? {};

  return (
    <div className="flex flex-col">
      {digestKey && (
        <>
          <SidebarContent size="lg">
            {getComponentByType({
              component: digestKey.component,
            })}
          </SidebarContent>
          <Separator />
        </>
      )}
      {((amount && unit) || cron) && (
        <>
          <SidebarContent size="lg">
            {getComponentByType({
              component: amount.component || unit.component || cron.component,
            })}
          </SidebarContent>
          <Separator />
        </>
      )}
    </div>
  );
};
