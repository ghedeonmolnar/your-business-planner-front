import {
  eventHourOptions,
  eventTimeToMinutes,
} from '@/features/events/utils/eventTimes';

test('event hour shortcuts cover the working schedule', () => {
  expect(eventHourOptions[0]).toEqual({ id: '08:00', name: '08:00' });
  expect(eventHourOptions[1]).toEqual({ id: '08:30', name: '08:30' });
  expect(eventHourOptions.at(-1)).toEqual({ id: '23:00', name: '23:00' });
  expect(eventHourOptions).toHaveLength(31);
});

test('event time to minutes only accepts working schedule values', () => {
  expect(eventTimeToMinutes('08:23')).toBe(503);
  expect(eventTimeToMinutes('23:00')).toBe(1380);
  expect(eventTimeToMinutes('07:59')).toBeNull();
  expect(eventTimeToMinutes('23:01')).toBeNull();
});
