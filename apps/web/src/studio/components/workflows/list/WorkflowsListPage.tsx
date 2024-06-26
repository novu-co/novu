import { SearchInput } from '@novu/design-system';
import { Button } from '@novu/novui';
import { IconOutlineAdd } from '@novu/novui/icons';
import { HStack } from '@novu/novui/jsx';
import { PageTemplate } from '../../../layout/index';
import { WorkflowsTable } from '../table/index';
import { useDiscover } from '../../../hooks/useBridgeAPI';
import { DocsButton } from '../../../../components/docs/DocsButton';
import { useSegment } from '../../../../components/providers/SegmentProvider';

export const WorkflowsListPage = () => {
  const { data, isLoading } = useDiscover();
  const segment = useSegment();

  return (
    <PageTemplate title="Workflows">
      <HStack justify={'space-between'}>
        <DocsButton
          TriggerButton={({ onClick }) => (
            <Button
              onClick={() => {
                segment.track('Add new workflow clicked - [Workflows page]');
                onClick();
              }}
              Icon={IconOutlineAdd}
              variant="transparent"
              py="50"
            >
              Add workflow
            </Button>
          )}
        />
        <SearchInput placeholder="Type name or identifier..." />
      </HStack>
      <WorkflowsTable workflows={data?.workflows || []} isLoading={isLoading} />
    </PageTemplate>
  );
};
