import { createEnvironment, deleteEnvironment, getEnvironments, updateEnvironment } from '@/api/environments';
import { QueryKeys } from '@/utils/query-keys';
import { IEnvironment } from '@novu/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useEnvironments() {
  return useQuery({
    queryKey: [QueryKeys.myEnvironments],
    queryFn: getEnvironments,
  });
}

export function useCreateEnvironment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEnvironment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.myEnvironments] });
    },
  });
}

export function useUpdateEnvironment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEnvironment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.myEnvironments] });
    },
  });
}

export function useDeleteEnvironment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ environment }: { environment: IEnvironment }) => deleteEnvironment({ environment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.myEnvironments] });
    },
  });
}
