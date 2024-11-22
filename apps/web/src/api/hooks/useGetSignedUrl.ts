import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { type IResponseError } from '@novu/shared';

import { getSignedUrl, type IGetSignedUrlParams, type ISignedUrlResponse } from '../storage';

export const useGetSignedUrl = (
  options: UseMutationOptions<ISignedUrlResponse, IResponseError, IGetSignedUrlParams> = {}
) => {
  const { mutateAsync: getSignedUrlMutation, ...mutationData } = useMutation<
    ISignedUrlResponse,
    IResponseError,
    IGetSignedUrlParams
  >(getSignedUrl, { ...options });

  return { getSignedUrl: getSignedUrlMutation, ...mutationData };
};
