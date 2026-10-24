import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { CalendarHallRow } from '@/features/bookings/components/CalendarHallRow';
import { CalendarMonth } from '@/features/bookings/components/CalendarMonth';
import { CalendarLegend } from '@/features/bookings/components/CalendarLegend';
import { theme } from '@/shared/theme/theme';

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
  const status = renderer?.root
    .findAllByType(Text)
    .find(
      node =>
        node.props.children === 'Liberă' &&
        StyleSheet.flatten(node.props.style)?.fontSize ===
          theme.typography.caption,
    );
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

test('afișează legenda fără liber sau necunoscut și fără simboluri în zile, păstrând datele lipsă accesibile', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <>
        <CalendarLegend period="month" />
        <CalendarMonth
          month="2026-11"
          selected="2026-11-01"
          days={[{ date: '2026-10-31', confirmed: 1, tentative: 0, free: 0 }]}
          onSelect={() => undefined}
        />
      </>,
    );
  });
  const texts = renderer?.root
    .findAllByType(Text)
    .map(node => node.props.children);
  expect(texts).not.toContain('•');
  expect(texts).not.toContain('?');
  expect(texts).not.toContain('Necunoscut');
  expect(texts).not.toContain('Liber');
  expect(texts).toContain('Parțial rezervat');
  expect(texts).toContain('Complet rezervat');
  expect(
    renderer?.root.findAll(
      node =>
        typeof node.props.accessibilityLabel === 'string' &&
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
  if (example.background === theme.colors.menu.success) {
    expect(StyleSheet.flatten(day?.props.style).color).toBe(
      theme.colors.menu.surface,
    );
  }
  await ReactTestRenderer.act(async () => renderer?.unmount());
});
