export const PauseModalDescription = ({ workflowName }: { workflowName: string }) => (
  <>
    The <strong>{workflowName}</strong> workflow cannot be triggered if paused, please confirm to proceed.
  </>
);

export const PAUSE_MODAL_TITLE = 'Proceeding will pause the workflow';
