import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createEmployeeApi,
  deleteEmployeeApi,
  forceDeleteEmployeeApi,
  getEmployeeProfileApi,
  getEmployeesApi,
  inviteEmployeeApi,
  blockEmployeeApi,
  unblockEmployeeApi,
  updateEmployeeApi,
} from '@/features/employees/api/employeesApi';
import { EmployeePayload } from '@/features/employees/types';
import { invalidateSchedulingData } from '@/shared/api/queryInvalidation';
import { queryKeys } from '@/shared/api/queryKeys';

export const useEmployees = () =>
  useQuery({
    queryKey: queryKeys.employees.all,
    queryFn: getEmployeesApi,
  });

export const useEmployeeProfile = (id: string) =>
  useQuery({
    queryKey: queryKeys.employees.detail(id),
    queryFn: () => getEmployeeProfileApi(id),
  });

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEmployeeApi,
    onSuccess: () => invalidateSchedulingData(queryClient),
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EmployeePayload }) =>
      updateEmployeeApi(id, payload),
    onSuccess: () => invalidateSchedulingData(queryClient),
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEmployeeApi,
    onSuccess: () => invalidateSchedulingData(queryClient),
  });
};

export const useForceDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: forceDeleteEmployeeApi,
    onSuccess: () => invalidateSchedulingData(queryClient),
  });
};

export const useInviteEmployee = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) => inviteEmployeeApi(id, email),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.employees.detail(id) }),
  });
};

export const useBlockEmployee = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => blockEmployeeApi(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.employees.detail(id) }),
  });
};

export const useUnblockEmployee = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => unblockEmployeeApi(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.employees.detail(id) }),
  });
};
