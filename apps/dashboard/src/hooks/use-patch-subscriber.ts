import { patchSubscriber } from '@/api/subscribers';
import { useEnvironment } from '@/context/environment/hooks';
import { QueryKeys } from '@/utils/query-keys';
import { OmitEnvironmentFromParameters } from '@/utils/types';
import { SubscriberResponseDto } from '@novu/api/models/components';
import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';

type PatchSubscriberParameters = OmitEnvironmentFromParameters<typeof patchSubscriber>;

export const usePatchSubscriber = (
  options?: UseMutationOptions<SubscriberResponseDto, unknown, PatchSubscriberParameters>
) => {
  const queryClient = useQueryClient();
  const { currentEnvironment } = useEnvironment();

  const { mutateAsync, ...rest } = useMutation({
    mutationFn: (args: PatchSubscriberParameters) => patchSubscriber({ environment: currentEnvironment!, ...args }),
    ...options,
    onSuccess: async (data, variables, ctx) => {
      await queryClient.invalidateQueries({
        queryKey: [QueryKeys.fetchSubscribers],
      });

      await queryClient.invalidateQueries({
        queryKey: [QueryKeys.fetchSubscriber],
      });

      options?.onSuccess?.(data, variables, ctx);
    },
  });

  return {
    ...rest,
    patchSubscriber: mutateAsync,
  };
};
