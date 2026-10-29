import { useEffect, useRef } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { AuthUser } from '@/features/auth/types';
import { bookingAvailabilityOwner } from '@/features/bookings/utils/bookingAvailability';
import { setCalendarAvailabilityOwner } from '@/shared/storage/calendarAvailabilityStorage';
import { queryKeys } from '@/shared/api/queryKeys';
import { reportError } from '@/shared/monitoring/reportError';

export const useCalendarCacheBoundary = (
  user: AuthUser | null,
  client: QueryClient,
  bootstrapping: boolean,
) => {
  const owner = user?.subscription?.active
    ? bookingAvailabilityOwner(user)
    : '';
  const previous = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (bootstrapping) return;
    const previousCompany = previous.current?.split('|')[1];
    if (previous.current && previous.current !== owner && previousCompany)
      client.removeQueries({
        queryKey: queryKeys.planner.dateAvailabilities(previousCompany),
      });
    previous.current = owner;
    void setCalendarAvailabilityOwner(owner).catch(error =>
      reportError(error, { source: 'calendar-cache-identity' }),
    );
  }, [client, owner, bootstrapping]);
};
