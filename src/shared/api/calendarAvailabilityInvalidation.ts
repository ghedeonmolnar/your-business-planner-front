import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryKeys';
import { CalendarAvailabilityWindow } from '@/shared/storage/calendarAvailabilitySchema';
import { invalidateStoredCalendarAvailability } from '@/shared/storage/calendarAvailabilityStorage';
import { reportError } from '@/shared/monitoring/reportError';

export const invalidateCalendarAvailability = (
  client: QueryClient,
  companyId: string,
  revision?: string,
) => {
  void invalidateStoredCalendarAvailability(companyId, revision).catch(error =>
    reportError(error, { source: 'invalidate-calendar-cache' }),
  );
  for (const [
    queryKey,
    data,
  ] of client.getQueriesData<CalendarAvailabilityWindow>({
    queryKey: queryKeys.planner.dateAvailabilities(companyId),
  })) {
    if (revision && (!data || data.revision === revision)) continue;
    if (client.getQueryState(queryKey)?.isInvalidated) continue;
    void client.invalidateQueries({
      queryKey,
      exact: true,
      refetchType: 'none',
    });
    void client
      .cancelQueries({ queryKey, exact: true })
      .then(() =>
        client.refetchQueries(
          { queryKey, exact: true, type: 'active' },
          { cancelRefetch: false },
        ),
      );
  }
};
