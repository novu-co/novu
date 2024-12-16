import { InfiniteData, useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { ButtonTypeEnum, IMessage, INotificationDto, IPaginatedResponse, MessageActionStatusEnum } from '@novu/shared';

import { useNovuContext } from './useNovuContext';
import { useFetchNotificationsQueryKey } from './useFetchNotificationsQueryKey';

interface IUpdateActionVariables {
  messageId: string;
  actionButtonType: ButtonTypeEnum;
  status: MessageActionStatusEnum;
  payload?: Record<string, unknown>;
}

export const useUpdateAction = ({
  onSuccess,
  ...options
}: {
  onSuccess?: () => void;
} & UseMutationOptions<IMessage, Error, IUpdateActionVariables> = {}) => {
  const queryClient = useQueryClient();
  const { apiService } = useNovuContext();
  const fetchNotificationsQueryKey = useFetchNotificationsQueryKey();

  const { mutate, ...result } = useMutation<IMessage, Error, IUpdateActionVariables>(
    async (variables) => {
      const notificationDto: INotificationDto = await apiService.updateAction(
        variables.messageId,
        variables.actionButtonType,
        variables.status,
        variables.payload
      );

      return {
        ...notificationDto,
        _id: notificationDto._id,
        payload: notificationDto.payload || {},
      };
    },
    {
      ...options,
      onSuccess: (newMessage, variables, context) => {
        queryClient.setQueriesData<InfiniteData<IPaginatedResponse<IMessage>>>(
          { queryKey: fetchNotificationsQueryKey, exact: false },
          (infiniteData) => {
            const pages = infiniteData.pages.map((page) => {
              const data = page.data.map((message) => {
                if (message._id === variables.messageId) {
                  return newMessage;
                }

                return message;
              });

              return {
                ...page,
                data,
              };
            });

            return {
              pageParams: infiniteData.pageParams,
              pages,
            };
          }
        );
        onSuccess?.(newMessage, variables, context);
      },
    }
  );

  return { ...result, updateAction: mutate };
};
