import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createMascotApi,
  deleteMascotApi,
  forceDeleteMascotApi,
  getMascotProfileApi,
  getMascotsApi,
  updateMascotApi,
} from '@/features/mascots/api/mascotsApi';
import { MascotPayload } from '@/features/mascots/types';
import { invalidateSchedulingData } from '@/shared/api/queryInvalidation';
import { queryKeys } from '@/shared/api/queryKeys';

export const useMascots = () =>
  useQuery({
    queryKey: queryKeys.mascots.all,
    queryFn: getMascotsApi,
  });

export const useMascotProfile = (id: string) =>
  useQuery({
    queryKey: queryKeys.mascots.detail(id),
    queryFn: () => getMascotProfileApi(id),
  });

export const useCreateMascot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMascotApi,
    onSuccess: () => invalidateSchedulingData(queryClient),
  });
};

export const useUpdateMascot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MascotPayload }) =>
      updateMascotApi(id, payload),
    onSuccess: () => invalidateSchedulingData(queryClient),
  });
};

export const useDeleteMascot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMascotApi,
    onSuccess: () => invalidateSchedulingData(queryClient),
  });
};

export const useForceDeleteMascot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: forceDeleteMascotApi,
    onSuccess: () => invalidateSchedulingData(queryClient),
  });
};
