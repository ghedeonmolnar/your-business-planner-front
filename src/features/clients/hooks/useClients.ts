import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createClientApi,
  deleteClientApi,
  getClientApi,
  getClientEventsPageApi,
  getClientsPageApi,
  lookupClientApi,
  updateClientApi,
} from '@/features/clients/api/clientsApi';
import { ClientPayload } from '@/features/clients/types';
import { EventTimeframe } from '@/features/events/types';
import { invalidateClientData } from '@/shared/api/queryInvalidation';
import { queryKeys } from '@/shared/api/queryKeys';

const CLIENTS_PAGE_SIZE = 20;
const CLIENT_EVENTS_PAGE_SIZE = 20;

export const useClients = () =>
  useInfiniteQuery({
    queryKey: queryKeys.clients.all,
    queryFn: ({ pageParam }) => getClientsPageApi(pageParam, CLIENTS_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: lastPage =>
      lastPage.page < lastPage.lastPage ? lastPage.page + 1 : undefined,
  });

export const useClient = (id: string | null, enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.clients.detail(id ?? ''),
    queryFn: () => getClientApi(id ?? ''),
    enabled: enabled && Boolean(id),
  });

export const useClientEvents = (
  id: string,
  timeframe: EventTimeframe,
  enabled: boolean,
) =>
  useInfiniteQuery({
    queryKey: queryKeys.clients.events(id, timeframe),
    queryFn: ({ pageParam }) =>
      getClientEventsPageApi(id, timeframe, pageParam, CLIENT_EVENTS_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: lastPage =>
      lastPage.page < lastPage.lastPage ? lastPage.page + 1 : undefined,
    enabled,
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[1] === id ? previousData : undefined,
  });

export const useClientLookup = (
  channel: string,
  contactValue: string,
  enabled: boolean,
) =>
  useQuery({
    queryKey: queryKeys.clients.lookup(channel, contactValue),
    queryFn: () => lookupClientApi(channel, contactValue),
    enabled: enabled && Boolean(channel) && Boolean(contactValue),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClientApi,
    onSuccess: () => invalidateClientData(queryClient),
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ClientPayload }) =>
      updateClientApi(id, payload),
    onSuccess: (_data, variables) =>
      invalidateClientData(queryClient, variables.id),
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteClientApi,
    onSuccess: (_data, id) => {
      invalidateClientData(queryClient);
      queryClient.removeQueries({ queryKey: queryKeys.clients.detail(id) });
    },
  });
};
