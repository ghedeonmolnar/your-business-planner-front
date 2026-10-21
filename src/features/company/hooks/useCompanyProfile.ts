import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  getCompanyProfileApi,
  lookupFiscalProfileApi,
  saveOwnerProfileApi,
} from '@/features/company/api/companyProfileApi';
import { queryKeys } from '@/shared/api/queryKeys';

export function useCompanyProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.planner.companyProfile(user?.company?.id ?? ''),
    queryFn: ({ signal }) => getCompanyProfileApi(signal),
    enabled: user?.role === 'owner' && Boolean(user.subscription?.active),
    staleTime: 60_000,
  });
}

export const useFiscalLookup = () =>
  useMutation({ mutationFn: lookupFiscalProfileApi });
export const useSaveOwnerProfile = () =>
  useMutation({ mutationFn: saveOwnerProfileApi });
