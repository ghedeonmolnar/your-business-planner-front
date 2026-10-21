import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ro';
import { Event } from '@/features/events/types';

export type DashboardMonthSection = {
  data: Event[];
  key: string;
  title: string;
};

const capitalize = (value: string) =>
  `${value.charAt(0).toUpperCase()}${value.slice(1)}`;

const monthTitle = (month: Dayjs, currentMonth: Dayjs) => {
  const monthName = capitalize(month.locale('ro').format('MMMM'));

  if (month.isSame(currentMonth, 'month')) {
    return `Luna curentă - ${monthName}`;
  }

  return month.year() === currentMonth.year()
    ? monthName
    : `${monthName} ${month.year()}`;
};

export const groupDashboardEventsByMonth = (
  events: Event[],
  now: Dayjs = dayjs(),
): DashboardMonthSection[] => {
  const currentMonth = now.startOf('month');
  const sections = new Map<string, DashboardMonthSection>();
  const orderedEvents = [...events].sort((first, second) => {
    const firstSchedule = `${first.date}T${first.start_time ?? ''}`;
    const secondSchedule = `${second.date}T${second.start_time ?? ''}`;

    return firstSchedule.localeCompare(secondSchedule);
  });

  orderedEvents.forEach(event => {
    const month = dayjs(event.date).startOf('month');
    const key = month.format('YYYY-MM');
    const existingSection = sections.get(key);

    if (existingSection) {
      existingSection.data.push(event);
      return;
    }

    sections.set(key, {
      data: [event],
      key,
      title: monthTitle(month, currentMonth),
    });
  });

  return [...sections.values()];
};
