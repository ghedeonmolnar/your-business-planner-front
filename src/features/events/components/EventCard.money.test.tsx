import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import dayjs from 'dayjs';
import { EventCard } from '@/features/events/components/EventCard';
import { event } from '@/features/events/components/eventCardTestFixtures';

test('shows what is left to collect before the event', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<EventCard event={event} />);
  });

  expect(
    renderer?.root.findByProps({ testID: 'event-balance-pill' }).props.label,
  ).toBe('400 lei');
  expect(
    renderer?.root.findAllByProps({ testID: 'event-paid-pill' }),
  ).toHaveLength(0);

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });
});

test('shows the collected amount after the event has ended', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  const pastEvent = {
    ...event,
    date: dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
    balance_due: 0,
    paid_amount: 500,
  };

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<EventCard event={pastEvent} />);
  });

  expect(
    renderer?.root.findByProps({ testID: 'event-paid-pill' }).props.label,
  ).toBe('500 lei');
  expect(
    renderer?.root.findAllByProps({ testID: 'event-balance-pill' }),
  ).toHaveLength(0);

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });
});
