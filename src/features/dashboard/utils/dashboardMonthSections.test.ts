import dayjs from 'dayjs';
import { groupDashboardEventsByMonth } from '@/features/dashboard/utils/dashboardMonthSections';
import { Event } from '@/features/events/types';

const event = (id: string, date: string, startTime: string): Event => ({
  id,
  client_id: null,
  employee_id: null,
  mascot_id: null,
  date,
  start_time: startTime,
  end_time: null,
  price_per_hour: 0,
  location: 'Oradea',
  type: 'aniversare',
});

test('grupează evenimentele doar în lunile care conțin rezervări', () => {
  const sections = groupDashboardEventsByMonth(
    [
      event('november', '2026-11-08', '17:00'),
      event('october-late', '2026-10-20', '18:00'),
      event('september', '2026-09-27', '15:00'),
      event('october-early', '2026-10-17', '16:00'),
    ],
    dayjs('2026-09-23'),
  );

  expect(sections.map(section => section.title)).toEqual([
    'Luna curentă - Septembrie',
    'Octombrie',
    'Noiembrie',
  ]);
  expect(sections.map(section => section.data.map(item => item.id))).toEqual([
    ['september'],
    ['october-early', 'october-late'],
    ['november'],
  ]);
});

test('adaugă anul când lista trece în anul următor', () => {
  const sections = groupDashboardEventsByMonth(
    [event('january', '2027-01-10', '12:00')],
    dayjs('2026-12-20'),
  );

  expect(sections[0].title).toBe('Ianuarie 2027');
});
