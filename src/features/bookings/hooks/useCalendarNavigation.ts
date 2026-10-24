import { useState } from 'react';
import dayjs from 'dayjs';
import { companyNow } from '@/shared/utils/formatDate';

export type CalendarPeriod = 'month' | 'year';
const DAYS_PER_WEEK = 7;
const MONDAY_INDEX = 1;

export function useCalendarNavigation() {
  const [period, setPeriod] = useState<CalendarPeriod>('month');
  const [selected, setSelected] = useState(() =>
    companyNow().format('YYYY-MM-DD'),
  );
  const first = dayjs(selected).startOf(period);
  const last = dayjs(selected).endOf(period);
  const mondayOffset =
    (first.day() + DAYS_PER_WEEK - MONDAY_INDEX) % DAYS_PER_WEEK;
  const sundayOffset = (DAYS_PER_WEEK - last.day()) % DAYS_PER_WEEK;
  return {
    period,
    setPeriod,
    selected,
    selectDate: setSelected,
    from: (period === 'month'
      ? first.subtract(mondayOffset, 'day')
      : first
    ).format('YYYY-MM-DD'),
    to: (period === 'month' ? last.add(sundayOffset, 'day') : last).format(
      'YYYY-MM-DD',
    ),
    move: (direction: number) =>
      setSelected(value =>
        dayjs(value).add(direction, period).format('YYYY-MM-DD'),
      ),
    today: () => setSelected(companyNow().format('YYYY-MM-DD')),
    selectMonth: (month: string) =>
      setSelected(value => {
        const firstOfMonth = dayjs(`${month}-01`);
        return firstOfMonth
          .date(Math.min(dayjs(value).date(), firstOfMonth.daysInMonth()))
          .format('YYYY-MM-DD');
      }),
  };
}
