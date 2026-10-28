import { getCalendarApi } from '@/features/bookings/api/bookingsApi';
import { bookingAvailabilityWindow } from '@/features/bookings/utils/bookingAvailability';
import { assertCurrentRequestSession } from '@/shared/api/requestSession';
import { getSessionGeneration } from '@/shared/api/sessionExpiry';
import {
  calendarAvailabilityEpoch,
  isCalendarAvailabilityCurrent,
  persistCalendarAvailability,
} from '@/shared/storage/calendarAvailabilityStorage';
import { reportError } from '@/shared/monitoring/reportError';

type AvailabilityContext = {
  owner: string;
  hallId: string;
  excludedEventId?: string;
  from: string;
  to: string;
};

export const getBookingAvailabilityApi = async (
  companyId: string,
  context: AvailabilityContext,
  signal: AbortSignal,
) => {
  const generation = getSessionGeneration();
  const epoch = calendarAvailabilityEpoch(companyId);
  const summary = await getCalendarApi(
    {
      hall_id: context.hallId,
      date_from: context.from,
      date_to: context.to,
      exclude_event_id: context.excludedEventId,
    },
    signal,
  );
  assertCurrentRequestSession(generation);
  if (signal.aborted) throw new Error('CALENDAR_REQUEST_ABORTED');
  const window = bookingAvailabilityWindow(summary, context);
  try {
    await persistCalendarAvailability(window, generation, epoch);
  } catch (error) {
    assertCurrentRequestSession(generation);
    reportError(error, { source: 'persist-calendar-cache' });
  }
  if (signal.aborted) throw new Error('CALENDAR_REQUEST_ABORTED');
  return {
    ...window,
    invalidated: !isCalendarAvailabilityCurrent(
      companyId,
      epoch,
      window.revision,
    ),
  };
};
