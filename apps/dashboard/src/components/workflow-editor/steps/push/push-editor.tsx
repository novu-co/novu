import { RiCellphoneFill } from 'react-icons/ri';
import { type UiSchema } from '@novu/shared';

import { getComponentByType } from '@/components/workflow-editor/steps/component-utils';
import { TabsSection } from '@/components/workflow-editor/steps/tabs-section';

type PushEditorProps = { uiSchema: UiSchema };

export const PushEditor = (props: PushEditorProps) => {
  const { uiSchema } = props;
  const { body, subject } = uiSchema?.properties ?? {};

  return (
    <div className="flex h-full flex-col">
      <TabsSection>
        <div className="flex items-center gap-2.5 text-sm font-medium">
          <RiCellphoneFill className="size-3" />
          <span>Push template editor</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-neutral-100 p-1">
          {getComponentByType({ component: subject.component })}
          {getComponentByType({ component: body.component })}
        </div>
      </TabsSection>
    </div>
  );
};
