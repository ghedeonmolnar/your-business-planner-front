import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteEventMapApi,
  getEventMapSelectorApi,
  resolveEventMapApi,
  saveEventMapApi,
} from '@/features/events/api/eventMapApi';
import { Event } from '@/features/events/types';
import { invalidateEventMapLocation } from '@/shared/api/queryInvalidation';
import { queryKeys } from '@/shared/api/queryKeys';
import { MapSelection } from '@/shared/types/mapLocation';

export const useEventMapSelector = (eventId: string) =>
  useQuery({
    queryKey: queryKeys.events.mapSelector(eventId),
    queryFn: ({ signal }) => getEventMapSelectorApi(eventId, signal),
    staleTime: 0,
    gcTime: 0,
    retry: false,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

export const useResolveEventMap = (eventId: string) =>
  useMutation({
    mutationFn: ({
      selection,
      signal,
    }: {
      selection: MapSelection;
      signal: AbortSignal;
    }) => resolveEventMapApi(eventId, selection, signal),
  });

export const useEventMapMutations = (eventId: string) => {
  const queryClient = useQueryClient();
  const updateCache = (data: Awaited<ReturnType<typeof saveEventMapApi>>) => {
    queryClient.setQueryData<Event>(
      queryKeys.events.detail(eventId),
      previous => (previous ? { ...previous, ...data } : previous),
    );
    invalidateEventMapLocation(queryClient, eventId);
  };
  const save = useMutation({
    mutationFn: ({
      selection,
      locationRevision,
    }: {
      selection: MapSelection;
      locationRevision: string;
    }) => saveEventMapApi(eventId, selection, locationRevision),
    onSuccess: updateCache,
  });
  const remove = useMutation({
    mutationFn: () => deleteEventMapApi(eventId),
    onSuccess: updateCache,
  });
  return { save, remove };
};
