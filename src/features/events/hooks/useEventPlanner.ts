import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useEventsInRange } from '@/features/events/hooks/useEvents';

export const useEventPlanner = (enabled: boolean) => {
  const today = dayjs().format('YYYY-MM-DD');
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(today.slice(0, 7));
  const monthStart = dayjs(`${visibleMonth}-01`)
    .startOf('month')
    .format('YYYY-MM-DD');
  const monthEnd = dayjs(`${visibleMonth}-01`)
    .endOf('month')
    .format('YYYY-MM-DD');
  const monthEventsQuery = useEventsInRange(monthStart, monthEnd, enabled);
  const monthEvents = useMemo(
    () => monthEventsQuery.data ?? [],
    [monthEventsQuery.data],
  );

  return {
    monthEvents,
    monthEventsQuery,
    selectedDate,
    setSelectedDate,
    setVisibleMonth,
  };
};

export type EventPlanner = ReturnType<typeof useEventPlanner>;
