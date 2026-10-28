import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { CalendarHallRow } from '@/features/bookings/components/CalendarHallRow';
import { CalendarMonth } from '@/features/bookings/components/CalendarMonth';
import { CalendarLegend } from '@/features/bookings/components/CalendarLegend';
import { MetaPill } from '@/shared/components/MetaPill';
import { theme } from '@/shared/theme/theme';

jest.mock('@/shared/hooks/useSingleColumnLayout', () => ({
  useSingleColumnLayout: () => false,
}));

const luminance = (color: string) => {
  const channels = color
    .replace('#', '')
    .match(/.{2}/g)
    ?.map(channel => {
      const value = parseInt(channel, 16) / 255;
      return value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    });
  if (!channels || channels.length !== 3)
    throw new Error('Culoare RGB indisponibilă');
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
};

test('textul mic pentru sala liberă are contrast de cel puțin 4,5:1 pe fundalul real', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <CalendarHallRow
        hall={{
          id: 'hall-1',
          name: 'Sala',
          capacity: 100,
          booking_id: null,
          status: 'free',
        }}
        typeLabel=""
        onPress={() => undefined}
      />,
    );
  });
  const status = renderer?.root.findByType(MetaPill).findByType(Text);
  if (!status) throw new Error('Stare indisponibilă');
  const foreground = luminance(StyleSheet.flatten(status.props.style).color);
  const background = luminance(
    StyleSheet.flatten(status.parent?.props.style).backgroundColor,
  );
  expect(
    (Math.max(foreground, background) + 0.05) /
      (Math.min(foreground, background) + 0.05),
  ).toBeGreaterThanOrEqual(4.5);
  await ReactTestRenderer.act(async () => renderer?.unmount());
});

test('arată legenda pentru ocuparea completă și descrie accesibil ocuparea și datele lipsă', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <>
        <CalendarLegend />
        <CalendarMonth
          month="2026-11"
          selected="2026-11-01"
          days={[
            { date: '2026-11-01', confirmed: 1, tentative: 0, free: 0 },
            { date: '2026-11-02', confirmed: 1, tentative: 0, free: 1 },
            { date: '2026-11-03', confirmed: 0, tentative: 0, free: 2 },
          ]}
          onSelect={() => undefined}
        />
      </>,
    );
  });
  const texts = renderer?.root
    .findAllByType(Text)
    .map(node => node.props.children);
  expect(texts).toEqual(
    expect.arrayContaining(['Azi', 'Selectat', 'Rezervat', 'Complet']),
  );
  expect(
    texts?.filter(text => ['○', '◐', '●', '?'].includes(String(text))),
  ).toEqual([]);
  for (const label of ['complet rezervat', 'parțial rezervat']) {
    expect(
      renderer?.root.findAll(
        node =>
          typeof node.props?.accessibilityLabel === 'string' &&
          node.props.accessibilityLabel.includes(label),
      ).length,
    ).toBeGreaterThan(0);
  }
  expect(
    renderer?.root.findAll(
      node =>
        typeof node.props?.accessibilityLabel === 'string' &&
        node.props.accessibilityLabel.includes('date indisponibile'),
    ).length,
  ).toBeGreaterThan(0);
  await ReactTestRenderer.act(async () => renderer?.unmount());
});

test.each([
  {
    label: '2 din 3 săli ocupate',
    confirmed: 2,
    tentative: 0,
    free: 1,
    hasHalls: true,
    selected: false,
    background: theme.colors.menu.primarySoft,
  },
  {
    label: '1 din 1 săli ocupate',
    confirmed: 1,
    tentative: 0,
    free: 0,
    hasHalls: true,
    selected: false,
    background: theme.colors.menu.success,
  },
  {
    label: '3 din 3 săli ocupate, inclusiv provizorii, cu ziua selectată',
    confirmed: 2,
    tentative: 1,
    free: 0,
    hasHalls: true,
    selected: true,
    background: theme.colors.menu.success,
  },
  {
    label: 'nicio rezervare și nicio sală activă',
    confirmed: 0,
    tentative: 0,
    free: 0,
    hasHalls: false,
    selected: false,
    background: undefined,
  },
  {
    label: 'rezervare istorică fără săli active',
    confirmed: 1,
    tentative: 0,
    free: 0,
    hasHalls: false,
    selected: false,
    background: theme.colors.menu.primarySoft,
  },
])('distinge ocuparea pentru $label', async example => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <CalendarMonth
        month="2026-11"
        selected={example.selected ? '2026-11-02' : '2026-11-01'}
        hasHalls={example.hasHalls}
        days={[
          {
            date: '2026-11-02',
            confirmed: example.confirmed,
            tentative: example.tentative,
            free: example.free,
          },
        ]}
        onSelect={() => undefined}
      />,
    );
  });
  const day = renderer?.root
    .findAllByType(Text)
    .find(node => node.props.children === 2);
  expect(day).toBeDefined();
  expect(StyleSheet.flatten(day?.parent?.props.style).backgroundColor).toBe(
    example.background,
  );
  if (example.selected) {
    expect(StyleSheet.flatten(day?.props.style).color).toBe(
      theme.colors.menu.surface,
    );
  }
  await ReactTestRenderer.act(async () => renderer?.unmount());
});
