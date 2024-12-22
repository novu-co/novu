import { RiBookMarkedLine, RiRouteFill } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { VersionControlProd } from '@/components/icons/version-control-prod';
import { VersionControlDev } from '@/components/icons/version-control-dev';
import { CreateWorkflowButton } from '@/components/create-workflow-button';
import { useEnvironment } from '@/context/environment/hooks';
import { Button } from './primitives/button';
import { LinkButton } from './primitives/button-link';

export const WorkflowListEmpty = () => {
  const { currentEnvironment, switchEnvironment, oppositeEnvironment } = useEnvironment();

  const isProd = currentEnvironment?.name === 'Production';

  return isProd ? (
    <WorkflowListEmptyProd switchToDev={() => switchEnvironment(oppositeEnvironment?.slug)} />
  ) : (
    <WorkflowListEmptyDev />
  );
};

const WorkflowListEmptyProd = ({ switchToDev }: { switchToDev: () => void }) => (
  <div className="flex h-full w-full flex-col items-center justify-center gap-6">
    <VersionControlProd />
    <div className="flex flex-col items-center gap-2 text-center">
      <span className="text-foreground-900 block font-medium">No workflows in production</span>
      <p className="text-foreground-400 max-w-[60ch] text-sm">
        To sync workflows to production, switch to Development environment, select a workflow and click on 'Sync to
        Production,' or sync via novu CLI for code-first workflows.
      </p>
    </div>

    <div className="flex items-center justify-center gap-6">
      <LinkButton leadingIcon={RiBookMarkedLine}>
        <Link to={'https://docs.novu.co/concepts/workflows'} target="_blank">
          View docs
        </Link>
      </LinkButton>
      <Button variant="primary" size="xs" leadingIcon={RiRouteFill} onClick={switchToDev}>
        Switch to Development
      </Button>
    </div>
  </div>
);

const WorkflowListEmptyDev = () => (
  <div className="flex h-full w-full flex-col items-center justify-center gap-6">
    <VersionControlDev />
    <div className="flex flex-col items-center gap-2 text-center">
      <span className="text-foreground-900 block font-medium">
        Create your first workflow to orchestrate notifications
      </span>
      <p className="text-foreground-400 max-w-[60ch] text-sm">
        Workflows in Novu handle event-driven notifications across multiple channels in a single, version-controlled
        flow, with the ability to manage preference for each subscriber.
      </p>
    </div>

    <div className="flex items-center justify-center gap-6">
      <LinkButton leadingIcon={RiBookMarkedLine}>
        <Link to={'https://docs.novu.co/concepts/workflows'} target="_blank">
          View docs
        </Link>
      </LinkButton>
      <CreateWorkflowButton asChild>
        <Button leadingIcon={RiRouteFill} variant="primary" size="xs">
          Create workflow
        </Button>
      </CreateWorkflowButton>
    </div>
  </div>
);
