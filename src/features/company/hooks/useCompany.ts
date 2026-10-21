import { hasCompanyFeature } from '@/features/company/utils/companyFeatures';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  unblockAccountApi,
  getAccountInvitationsApi,
  revokeInvitationApi,
  saveCompanySettingsApi,
  getStaffAvailabilityApi,
  blockAccountApi,
  getDirectoryApi,
  getOverviewApi,
  getTeamApi,
  inviteAccountApi,
  saveDirectoryApi,
} from '@/features/company/api/companyApi';
import { DirectoryKind } from '@/features/company/types';
import { queryKeys } from '@/shared/api/queryKeys';
import {
  invalidatePlannerDirectory,
  invalidatePlannerTeam,
  invalidatePlannerCompany,
} from '@/shared/api/queryInvalidation';

export const useDirectory = (kind: DirectoryKind, search = '') => {
  const { user } = useAuth();
  return useInfiniteQuery({
    queryKey: queryKeys.planner.directory(user?.company?.id ?? '', kind, {
      search,
    }),
    queryFn: ({ pageParam, signal }) =>
      getDirectoryApi(kind, pageParam, signal, search),
    initialPageParam: 1,
    getNextPageParam: page =>
      page.page < page.lastPage ? page.page + 1 : undefined,
    enabled: Boolean(
      user?.subscription?.active &&
      user.role !== 'employee' &&
      (kind !== 'employees' || hasCompanyFeature(user, 'staff')),
    ),
    staleTime: 30_000,
  });
};
export const useSaveDirectory = () => {
  const client = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: saveDirectoryApi,
    onSuccess: (_result, variables) =>
      invalidatePlannerDirectory(
        client,
        user?.company?.id ?? '',
        variables.kind,
      ),
  });
};
export const useTeam = () => {
  const { user } = useAuth();
  return useInfiniteQuery({
    queryKey: queryKeys.planner.directory(user?.company?.id ?? '', 'team'),
    queryFn: ({ pageParam, signal }) => getTeamApi(pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: page =>
      page.page < page.lastPage ? page.page + 1 : undefined,
    enabled: user?.role === 'owner' && Boolean(user.subscription?.active),
  });
};
export const useInviteAccount = () => {
  const client = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: inviteAccountApi,
    onSuccess: () => invalidatePlannerTeam(client, user?.company?.id ?? ''),
  });
};
export const useBlockAccount = () => {
  const client = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: blockAccountApi,
    onSuccess: () => invalidatePlannerTeam(client, user?.company?.id ?? ''),
  });
};
export const useOverview = (from: string, to: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.planner.overview(user?.company?.id ?? '', from, to),
    queryFn: ({ signal }) => getOverviewApi(from, to, signal),
    enabled: Boolean(
      user?.subscription?.active &&
      user.role !== 'employee' &&
      hasCompanyFeature(user, 'finance'),
    ),
  });
};

export const useStaffAvailability = (
  start: string | null,
  end: string | null,
  eventId?: string,
) => {
  const { user } = useAuth();
  return useInfiniteQuery({
    queryKey: queryKeys.planner.directory(
      user?.company?.id ?? '',
      'availability',
      {
        starts_at: start ?? undefined,
        ends_at: end ?? undefined,
        exclude_event_id: eventId,
      },
    ),
    queryFn: ({ pageParam, signal }) =>
      getStaffAvailabilityApi(
        start ?? '',
        end ?? '',
        eventId,
        pageParam,
        signal,
      ),
    initialPageParam: 1,
    getNextPageParam: page =>
      page.page < page.lastPage ? page.page + 1 : undefined,
    enabled: Boolean(
      start &&
      end &&
      user?.subscription?.active &&
      user.role !== 'employee' &&
      hasCompanyFeature(user, 'staff'),
    ),
  });
};

export const useSaveCompanySettings = () => {
  const client = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: saveCompanySettingsApi,
    onSuccess: () => invalidatePlannerCompany(client, user?.company?.id ?? ''),
  });
};

export const useAccountInvitations = () => {
  const { user } = useAuth();
  return useInfiniteQuery({
    queryKey: queryKeys.planner.directory(
      user?.company?.id ?? '',
      'invitations',
    ),
    queryFn: ({ pageParam, signal }) =>
      getAccountInvitationsApi(pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: page =>
      page.page < page.lastPage ? page.page + 1 : undefined,
    enabled: user?.role === 'owner' && Boolean(user.subscription?.active),
  });
};
export const useRevokeInvitation = () => {
  const client = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: revokeInvitationApi,
    onSuccess: () => invalidatePlannerTeam(client, user?.company?.id ?? ''),
  });
};
export const useUnblockAccount = () => {
  const client = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: unblockAccountApi,
    onSuccess: () => invalidatePlannerTeam(client, user?.company?.id ?? ''),
  });
};
