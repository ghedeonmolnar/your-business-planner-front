import { useMutation } from '@tanstack/react-query';
import { getEmployeeDirectoryApi } from '@/features/company/api/companyApi';

export const useReloadEmployeeDirectory = () =>
  useMutation({ mutationFn: getEmployeeDirectoryApi });
