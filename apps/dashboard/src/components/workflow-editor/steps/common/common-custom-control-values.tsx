import { Button } from '@/components/primitives/button';
import { useWorkflow } from '@/components/workflow-editor/workflow-provider';
import { RiCloseLine, RiEdit2Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { CustomStepControls } from '../controls/custom-step-controls';

export const CommonCustomControlValues = () => {
  const { step, workflow } = useWorkflow();
  const { dataSchema } = step?.controls ?? {};
  const navigate = useNavigate();

  if (!dataSchema || !workflow) {
    return null;
  }

  return (
    <>
      <header className="flex flex-row items-center gap-3 border-b border-b-neutral-200 p-3">
        <div className="mr-auto flex items-center gap-2.5 text-sm font-medium">
          <RiEdit2Line className="size-4" />
          <span>Configure Template</span>
        </div>
        <Button
          variant="ghost"
          size="xs"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate('../', { relative: 'path' });
          }}
        >
          <RiCloseLine className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </header>
      <CustomStepControls dataSchema={dataSchema} origin={workflow.origin} />
    </>
  );
};
