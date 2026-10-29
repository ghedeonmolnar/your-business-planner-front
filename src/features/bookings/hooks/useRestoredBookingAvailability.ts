import { useEffect, useState } from 'react';
import { getSessionGeneration } from '@/shared/api/sessionExpiry';
import { CalendarAvailabilityWindow } from '@/shared/storage/calendarAvailabilitySchema';
import { loadCalendarAvailability } from '@/shared/storage/calendarAvailabilityStorage';
import { reportError } from '@/shared/monitoring/reportError';

export const useRestoredBookingAvailability = (
  owner: string,
  open: boolean,
) => {
  const [restored, setRestored] = useState<{
    owner: string;
    windows: CalendarAvailabilityWindow[];
  }>();
  useEffect(() => {
    if (!open || !owner || restored?.owner === owner) return;
    let current = true;
    const generation = getSessionGeneration();
    void loadCalendarAvailability(owner, generation)
      .then(windows => {
        if (current) setRestored({ owner, windows });
      })
      .catch(error => {
        if (current && generation === getSessionGeneration()) {
          reportError(error, { source: 'restore-calendar-cache' });
          setRestored({ owner, windows: [] });
        }
      });
    return () => {
      current = false;
    };
  }, [open, owner, restored?.owner]);
  return restored;
};
