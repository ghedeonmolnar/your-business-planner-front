import { useEffect, useState, useSyncExternalStore } from 'react';
import { onlineManager, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import { getBookingAvailabilityApi } from '@/features/bookings/api/bookingAvailabilityApi';
import { useCalendarSync } from '@/features/bookings/hooks/useCalendarSync';
import { useRestoredBookingAvailability } from '@/features/bookings/hooks/useRestoredBookingAvailability';
import {
  bookingAvailabilityOwner,
  bookingAvailabilityRange,
} from '@/features/bookings/utils/bookingAvailability';
import { queryKeys } from '@/shared/api/queryKeys';
import { CalendarAvailabilityWindow } from '@/shared/storage/calendarAvailabilitySchema';
import { touchCalendarAvailability } from '@/shared/storage/calendarAvailabilityStorage';
import { reportError } from '@/shared/monitoring/reportError';
import { companyNow } from '@/shared/utils/formatDate';

const CACHE_RETENTION_MS = 30 * 60_000;
const subscribeOnline = (listener: () => void) =>
  onlineManager.subscribe(listener);

export function useBookingDateAvailability(hallId: string, bookingId?: string) {
  const { user } = useAuth();
  const client = useQueryClient();
  const owner = bookingAvailabilityOwner(user);
  const companyId = user?.company?.id ?? '';
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => companyNow().format('YYYY-MM'));
  const [requested, setRequested] = useState<{
    owner: string;
    hallId: string;
    bookingId?: string;
    from: string;
    to: string;
  }>();
  const restored = useRestoredBookingAvailability(owner, open);
  const online = useSyncExternalStore(subscribeOnline, () =>
    onlineManager.isOnline(),
  );
  const synchronization = useCalendarSync(open && Boolean(hallId));

  const cached = client
    .getQueriesData<CalendarAvailabilityWindow>({
      queryKey: queryKeys.planner.dateAvailabilities(companyId),
    })
    .flatMap(([, data]) => (data ? [data] : []));
  const windows = [
    ...cached,
    ...(restored?.owner === owner ? restored.windows : []),
  ].filter(
    window =>
      window.owner === owner &&
      window.hallId === hallId &&
      window.excludedEventId === bookingId,
  );
  const ranges =
    requested?.owner === owner &&
    requested.hallId === hallId &&
    requested.bookingId === bookingId
      ? [...windows, requested]
      : windows;
  const range = bookingAvailabilityRange(month, ranges);
  const initial = windows.find(
    window => window.from === range.from && window.to === range.to,
  );
  const filters = {
    hall_id: hallId,
    date_from: range.from,
    date_to: range.to,
    exclude_event_id: bookingId,
  };
  const ready = restored?.owner === owner;
  const queryKey = queryKeys.planner.dateAvailability(
    companyId,
    owner,
    filters,
  );
  const query = useQuery({
    queryKey,
    queryFn: ({ signal }) =>
      getBookingAvailabilityApi(
        companyId,
        {
          owner,
          hallId,
          excludedEventId: bookingId,
          ...range,
        },
        signal,
      ),
    initialData: initial,
    initialDataUpdatedAt: initial?.lastUsedAt,
    enabled:
      open &&
      ready &&
      online &&
      Boolean(owner && hallId && user?.subscription?.active) &&
      (!initial || (synchronization.verified && !synchronization.isError)),
    staleTime: Infinity,
    gcTime: CACHE_RETENTION_MS,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (
      !open ||
      !ready ||
      !synchronization.verified ||
      !query.data ||
      query.isFetching ||
      (!query.data.invalidated &&
        query.dataUpdatedAt > synchronization.dataUpdatedAt)
    )
      return;
    const revision =
      synchronization.data?.availability_revision ??
      synchronization.data?.revision;
    if (
      (query.data.invalidated || query.data.revision !== revision) &&
      !client.getQueryState(queryKey)?.isInvalidated
    )
      void client.invalidateQueries({ queryKey, exact: true });
  }, [
    client,
    open,
    ready,
    synchronization.verified,
    synchronization.data,
    synchronization.dataUpdatedAt,
    query.data,
    query.dataUpdatedAt,
    query.isFetching,
    queryKey,
  ]);

  const hasData = Boolean(query.data);
  useEffect(() => {
    if (!open || !hasData) return;
    const window = client.getQueryData<CalendarAvailabilityWindow>(
      queryKeys.planner.dateAvailability(companyId, owner, {
        hall_id: hallId,
        date_from: range.from,
        date_to: range.to,
        exclude_event_id: bookingId,
      }),
    );
    if (window)
      void touchCalendarAvailability(window).catch(error =>
        reportError(error, { source: 'touch-calendar-cache' }),
      );
  }, [
    client,
    open,
    hasData,
    companyId,
    owner,
    hallId,
    range.from,
    range.to,
    bookingId,
  ]);
  const invalidated = client.getQueryState(queryKey)?.isInvalidated;
  return {
    disabledDates: query.data?.occupiedDates ?? [],
    loading: !ready || (!hasData && online && !query.isError),
    error: hasData
      ? undefined
      : (query.error ?? (!online ? new Error('CALENDAR_OFFLINE') : undefined)),
    unverified:
      hasData &&
      (!online ||
        !synchronization.verified ||
        Boolean(invalidated) ||
        query.isError ||
        query.data?.invalidated),
    onRetry: () => query.refetch(),
    onMonthChange: (date: string) => setMonth(date.slice(0, 7)),
    onOpen: (date: string) => {
      setRequested({
        owner,
        hallId,
        bookingId,
        ...bookingAvailabilityRange(date.slice(0, 7), windows),
      });
      setMonth(date.slice(0, 7));
      setOpen(true);
    },
    onClose: () => setOpen(false),
  };
}
