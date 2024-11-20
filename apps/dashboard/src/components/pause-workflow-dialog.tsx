export const PauseModalDescription = ({ workflowName }: { workflowName: string }) => (
  <>
    Pausing the <strong>{workflowName}</strong> workflow will immediately prevent your integration from being able to
    trigger it.
  </>
);

export const PAUSE_MODAL_TITLE = 'Proceeding will pause the workflow';
