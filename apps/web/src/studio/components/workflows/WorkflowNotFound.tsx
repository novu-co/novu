import { Text } from '@novu/novui';
import { PageContainer } from '../../layout';

export const WorkflowNotFound = () => {
  return (
    <PageContainer>
      <Text color={'typography.text.secondary'} textAlign={'center'}>
        Workflow not found
      </Text>
    </PageContainer>
  );
};
