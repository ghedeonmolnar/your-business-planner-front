import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import dayjs from 'dayjs';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { EventsCalendarPanel } from '@/features/events/components/EventsCalendarPanel';
import { EventPlanner } from '@/features/events/hooks/useEventPlanner';
import { Event } from '@/features/events/types';
import { theme } from '@/shared/theme/theme';

const todayDate = dayjs().format('YYYY-MM-DD');
const selectedDate = dayjs().add(1, 'day').format('YYYY-MM-DD');
const otherEventDate = dayjs().add(2, 'day').format('YYYY-MM-DD');

const selectedEvent: Event = {
  id: 'selected-event',
  client_id: 'client-1',
  employee_id: 'employee-1',
  mascot_id: 'mascot-1',
  date: selectedDate,
  start_time: '20:00',
  end_time: '21:30',
  price_per_hour: 500,
  location: 'Alesd',
  address: 'Bona Villa',
  type: 'nunta',
};

const otherEvent: Event = {
  ...selectedEvent,
  id: 'other-event',
  date: otherEventDate,
  location: 'Oradea',
};

function getRenderedText(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(getRenderedText).join('');
  }

  if (value && typeof value === 'object' && 'children' in value) {
    return getRenderedText((value as { children?: unknown }).children);
  }

  return '';
}

test('shows only selected-day events without availability controls', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  const planner = {
    monthEvents: [selectedEvent, otherEvent],
    monthEventsQuery: {
      error: null,
      isLoading: false,
      refetch: jest.fn(),
    },
    selectedDate,
    setSelectedDate: jest.fn(),
    setVisibleMonth: jest.fn(),
  } as unknown as EventPlanner;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <EventsCalendarPanel
        header={<Text>Calendar evenimente</Text>}
        onOpenEvent={jest.fn()}
        planner={planner}
      />,
    );
  });

  const renderedText = getRenderedText(renderer?.toJSON());

  expect(renderedText).toContain('Alesd');
  expect(renderedText).toContain('Bona Villa');
  expect(renderedText).not.toContain('Oradea');
  expect(renderedText).not.toContain('Start');
  expect(renderedText).not.toContain('Final');
  expect(renderedText).not.toContain('Angajați');
  expect(renderedText).not.toContain('Mascote');

  const calendar = renderer?.root.findByType(Calendar);
  const marks = calendar?.props.markedDates;

  expect(calendar?.props.markingType).toBe('custom');
  expect(marks[otherEvent.date]).toMatchObject({
    customStyles: {
      container: {
        backgroundColor: theme.colors.primary,
        borderColor: 'transparent',
        borderWidth: 2,
      },
      text: {
        color: theme.colors.surface,
      },
    },
  });
  expect(marks[otherEvent.date].marked).toBeUndefined();
  expect(marks[todayDate]).toMatchObject({
    customStyles: {
      container: {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.primary,
        borderWidth: 2,
      },
      text: {
        color: theme.colors.text,
      },
    },
  });
  expect(marks[selectedEvent.date]).toMatchObject({
    customStyles: {
      container: {
        backgroundColor: theme.colors.blueSoft,
        borderColor: theme.colors.primary,
        borderWidth: 2,
      },
      text: {
        color: theme.colors.text,
      },
    },
  });

  const dayStylesheet = calendar?.props.theme['stylesheet.day.basic'];

  expect(dayStylesheet.base).toMatchObject({
    alignItems: 'center',
    borderColor: 'transparent',
    borderWidth: 2,
    height: 36,
    justifyContent: 'center',
    width: 36,
  });
  expect(dayStylesheet.text).toMatchObject({
    includeFontPadding: false,
    marginTop: 0,
    textAlign: 'center',
  });
  expect(dayStylesheet.text).not.toHaveProperty('lineHeight');
  expect(dayStylesheet.text).not.toHaveProperty('height');

  const renderedDayStyle = (date: string) =>
    StyleSheet.flatten(
      renderer?.root
        .findAllByProps({ testID: `events-calendar.day_${date}` })
        .at(-1)?.props.style,
    );

  [otherEvent.date, todayDate, selectedEvent.date].forEach(date => {
    expect(renderedDayStyle(date)).toMatchObject({
      borderRadius: 18,
      height: 36,
      width: 36,
    });
  });
  expect(renderedDayStyle(otherEvent.date)).toMatchObject({
    backgroundColor: theme.colors.primary,
  });
  expect(renderedText).toContain('Evenimente în ziua selectată');

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });
});
