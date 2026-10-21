import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { EventCard } from '@/features/events/components/EventCard';
import {
  event,
  getRenderedText,
} from '@/features/events/components/eventCardTestFixtures';
import { theme } from '@/shared/theme/theme';

test('shows the event type and compact mascot names as pills', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <EventCard event={event} typeLabel="Aniversare" />,
    );
  });

  const renderedText = getRenderedText(renderer?.toJSON());
  const mascotPill = renderer?.root.findByProps({
    testID: 'event-mascots-pill',
  });
  const whatsappIcon = renderer?.root.findByProps({ name: 'logo-whatsapp' });

  expect(renderedText).toContain('Aniversare');
  expect(renderedText).toContain('Mickey, Spider');
  expect(
    renderer?.root.findByProps({
      backgroundColor: theme.colors.surfaceMuted,
      label: 'Aniversare',
    }),
  ).toBeDefined();
  expect(mascotPill?.props.label).toBe('Mickey, Spider');
  expect(
    renderer?.root.findAllByProps({ name: 'sparkles-outline' }),
  ).toHaveLength(0);
  expect(
    renderer?.root.findAllByProps({ name: 'calendar-outline' }),
  ).toHaveLength(0);
  expect(renderer?.root.findByProps({ name: 'call-outline' })).toBeDefined();
  expect(whatsappIcon?.props.color).toBe(theme.colors.success);

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });
});

test('does not show phone actions when the event has no phone number', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <EventCard event={{ ...event, contact_phone: null }} />,
    );
  });

  expect(renderer?.root.findAllByProps({ name: 'call-outline' })).toHaveLength(
    0,
  );
  expect(renderer?.root.findAllByProps({ name: 'logo-whatsapp' })).toHaveLength(
    0,
  );

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });
});

test('shows the full address next to the city on event cards', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <EventCard
        event={{ ...event, address: 'Strada Republicii 12, ap. 3' }}
      />,
    );
  });

  const renderedText = getRenderedText(renderer?.toJSON());

  expect(renderedText).toContain('Oradea');
  expect(renderedText).toContain('Strada Republicii 12, ap. 3');

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });
});

test('tapping the card body opens the event details', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  const onDetails = jest.fn();

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <EventCard event={event} onDetails={onDetails} />,
    );
  });

  await ReactTestRenderer.act(async () => {
    renderer?.root
      .findByProps({ testID: 'event-card-details' })
      .props.onPress();
  });

  expect(onDetails).toHaveBeenCalledWith(event);

  await ReactTestRenderer.act(async () => {
    renderer?.root
      .findByProps({ testID: 'event-card-meta-details' })
      .props.onPress();
  });

  expect(onDetails).toHaveBeenCalledTimes(2);

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });
});

test('hides the type pill and keeps the agenda card tappable', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  const onDetails = jest.fn();

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <EventCard event={event} onDetails={onDetails} showTypePill={false} />,
    );
  });

  expect(
    renderer?.root.findAllByProps({ testID: 'event-type-pill' }),
  ).toHaveLength(0);
  expect(
    renderer?.root.findAllByProps({ name: 'receipt-outline' }),
  ).toHaveLength(0);

  await ReactTestRenderer.act(async () => {
    renderer?.root
      .findByProps({ testID: 'event-card-details' })
      .props.onPress();
  });

  expect(onDetails).toHaveBeenCalledWith(event);

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });
});

test('shows compact management actions without a separate details icon', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  const onEdit = jest.fn();
  const onDelete = jest.fn();

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <EventCard event={event} onEdit={onEdit} onDelete={onDelete} />,
    );
  });

  expect(
    renderer?.root.findAllByProps({ name: 'receipt-outline' }),
  ).toHaveLength(0);

  await ReactTestRenderer.act(async () => {
    renderer?.root
      .findByProps({ accessibilityLabel: 'Editează eveniment' })
      .props.onPress();
    renderer?.root
      .findByProps({ accessibilityLabel: 'Șterge eveniment' })
      .props.onPress();
  });

  expect(onEdit).toHaveBeenCalledWith(event);
  expect(onDelete).toHaveBeenCalledWith(event);

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });
});

const dateOffsetByDays = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

test('shows the review link action only for finished events', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  const onSendReviewLink = jest.fn();
  const upcomingEvent = { ...event, date: dateOffsetByDays(7) };
  const finishedEvent = { ...event, date: dateOffsetByDays(-7) };

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <EventCard event={upcomingEvent} onSendReviewLink={onSendReviewLink} />,
    );
  });

  expect(
    renderer?.root.findAllByProps({
      accessibilityLabel: 'Trimite link de recenzie',
    }),
  ).toHaveLength(0);

  await ReactTestRenderer.act(async () => {
    renderer?.update(
      <EventCard event={finishedEvent} onSendReviewLink={onSendReviewLink} />,
    );
  });

  await ReactTestRenderer.act(async () => {
    renderer?.root
      .findByProps({ accessibilityLabel: 'Trimite link de recenzie' })
      .props.onPress();
  });

  expect(onSendReviewLink).toHaveBeenCalledWith(finishedEvent);

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });
});

test('does not offer the review link for cancelled events', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <EventCard
        event={{ ...event, date: dateOffsetByDays(-7), status: 'cancelled' }}
        onSendReviewLink={jest.fn()}
      />,
    );
  });

  expect(
    renderer?.root.findAllByProps({
      accessibilityLabel: 'Trimite link de recenzie',
    }),
  ).toHaveLength(0);

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });
});
