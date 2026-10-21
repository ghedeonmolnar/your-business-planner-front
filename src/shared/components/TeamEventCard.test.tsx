import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {
  TeamEventCard,
  formatTeamEventDuration,
} from '@/shared/components/TeamEventCard';

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

test('team event card shows date, city, participant, address, duration and earnings', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <TeamEventCard
        address="Strada Independentei 1"
        date="2026-08-21"
        durationMinutes={90}
        earnings={187.5}
        location="Oradea"
        participantLabel="Minnie"
      />,
    );
  });

  const renderedText = getRenderedText(renderer?.toJSON());
  const details = renderer?.root.findByProps({ numberOfLines: 1 });

  expect(renderedText).toContain('21 August - Oradea');
  expect(renderedText).toContain(
    'Minnie - Strada Independentei 1 - 1 oră 30 min',
  );
  expect(renderedText).toContain('187,5 lei');
  expect(details).toBeDefined();

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });
});

test('team event duration formats whole hours and minutes', () => {
  expect(formatTeamEventDuration(120)).toBe('2 ore');
  expect(formatTeamEventDuration(30)).toBe('30 min');
  expect(formatTeamEventDuration(0)).toBe('Ora necompletată');
});

test('deschide evenimentul când se apasă cardul', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  const onPress = jest.fn();

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <TeamEventCard
        address="Rasaritului nr20"
        date="2026-09-18"
        durationMinutes={120}
        earnings={250}
        location="Oradea"
        onPress={onPress}
        participantLabel="Molnar Ghedeon"
      />,
    );
  });

  const card = renderer?.root
    .findAll(node => typeof node.props.onPress === 'function')
    .at(0);

  await ReactTestRenderer.act(async () => {
    card?.props.onPress();
  });

  expect(onPress).toHaveBeenCalledTimes(1);

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });
});
