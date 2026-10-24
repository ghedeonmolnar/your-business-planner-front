import {
  useMutation,
  useMutationState,
  useQueryClient,
} from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import { saveDirectoryApi } from '@/features/company/api/companyApi';
import { ClientCreationPayload } from '@/features/company/types';
import { ApiError } from '@/shared/api/apiError';
import { queryKeys } from '@/shared/api/queryKeys';
import { invalidatePlannerDirectory } from '@/shared/api/queryInvalidation';

export function useClientCreation() {
  const { user } = useAuth();
  const client = useQueryClient();
  const companyId = user?.company?.id ?? '';
  const mutationKey = queryKeys.planner.clientCreations(companyId);
  const uncertain = useMutationState({
    filters: { mutationKey },
    select: mutation => {
      const error = mutation.state.error;
      const refused =
        error instanceof ApiError &&
        (error.reason === 'aborted' ||
          (error.status >= 400 && error.status < 500));
      const unresolved =
        mutation.state.status === 'pending' ||
        (mutation.state.status === 'error' && !refused);
      return unresolved
        ? (mutation.state.variables as ClientCreationPayload)
        : null;
    },
  }).filter((payload): payload is ClientCreationPayload => Boolean(payload));
  const mutation = useMutation({
    mutationKey,
    gcTime: Infinity,
    mutationFn: (payload: ClientCreationPayload) =>
      saveDirectoryApi({ kind: 'clients', payload }),
    onSuccess: (_result, payload) => {
      client
        .getMutationCache()
        .findAll({ mutationKey, status: 'error' })
        .forEach(attempt => {
          const previous = attempt.state.variables as
            ClientCreationPayload | undefined;
          if (previous?.operation_id === payload.operation_id)
            client.getMutationCache().remove(attempt);
        });
      invalidatePlannerDirectory(client, companyId, 'clients');
    },
  });
  return { ...mutation, uncertainCreation: uncertain.at(-1) };
}
