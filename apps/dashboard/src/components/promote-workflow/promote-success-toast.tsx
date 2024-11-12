import { Button } from '@/components/primitives/button';
import { ToastClose, ToastIcon } from '@/components/primitives/sonner';
import { useEnvironment } from '@/context/environment/hooks';
import { IEnvironment, WorkflowResponseDto } from '@novu/shared';
import { RiArrowRightSLine } from 'react-icons/ri';

interface PromoteSuccessToastProps {
  workflow: WorkflowResponseDto;
  environment?: IEnvironment;
  onClose: () => void;
}

export function PromoteSuccessToast({ workflow, environment, onClose }: PromoteSuccessToastProps) {
  const { switchEnvironment } = useEnvironment();

  function onSwitchEnvironmentClick() {
    onClose();
    switchEnvironment(environment?.slug || '');
  }

  return (
    <>
      <ToastIcon variant="default" />
      <div className="flex flex-1 flex-col items-start gap-2.5">
        <div className="flex flex-col items-start justify-center gap-1 self-stretch">
          <div className="text-foreground-950 text-sm font-medium">Workflow synced to {environment?.name}</div>
          <div className="text-foreground-600 text-sm">
            Workflow '{workflow.name}' has been successfully synced to {environment?.name}.
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 self-stretch">
          <Button variant="ghost" size="sm" className="text-destructive gap-1" onClick={onSwitchEnvironmentClick}>
            Switch to {environment?.name}
            <RiArrowRightSLine />
          </Button>
        </div>
      </div>
      <ToastClose onClick={onClose} />
    </>
  );
}
