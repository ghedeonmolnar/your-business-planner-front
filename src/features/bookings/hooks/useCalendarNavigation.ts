import { useState } from 'react';
import dayjs from 'dayjs';
import { companyNow } from '@/shared/utils/formatDate';

export type CalendarPeriod = 'month' | 'year';

export function useCalendarNavigation() {
  const [period, setPeriod] = useState<CalendarPeriod>('month');
  const [selected, setSelected] = useState(() =>
    companyNow().format('YYYY-MM-DD'),
  );
  return {
    period,
    setPeriod,
    selected,
    selectDate: setSelected,
    from: dayjs(selected).startOf(period).format('YYYY-MM-DD'),
    to: dayjs(selected).endOf(period).format('YYYY-MM-DD'),
    move: (direction: number) =>
      setSelected(value =>
        dayjs(value).add(direction, period).format('YYYY-MM-DD'),
      ),
    today: () => setSelected(companyNow().format('YYYY-MM-DD')),
    selectMonth: (month: string) =>
      setSelected(value => {
        const first = dayjs(`${month}-01`);
        return first
          .date(Math.min(dayjs(value).date(), first.daysInMonth()))
          .format('YYYY-MM-DD');
      }),
  };
}
