import { useMutation } from '@tanstack/react-query';
import { useEnvironment } from '@/context/environment/hooks';
import { deleteIntegration as deleteIntegrationApi } from '../api/integrations';

interface DeleteIntegrationResponse {
  acknowledged: boolean;
  status: number;
}

export function useDeleteIntegration() {
  const { currentEnvironment } = useEnvironment();
  const { mutateAsync: deleteIntegration, isPending: isLoading } = useMutation<
    DeleteIntegrationResponse,
    Error,
    { id: string }
  >({
    mutationFn: async ({ id }): Promise<DeleteIntegrationResponse> =>
      deleteIntegrationApi({ id, environment: currentEnvironment! }),
  });

  return { deleteIntegration, isLoading };
}
