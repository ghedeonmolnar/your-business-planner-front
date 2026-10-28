import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { BookingCard } from '@/features/bookings/components/BookingCard';
import { AgendaBookingCard } from '@/features/company/components/AgendaBookingCard';
import { plannerBooking } from '@/features/bookings/utils/plannerTestFixtures';
import { InfoRow } from '@/shared/components/InfoRow';
import { AppThemeProvider } from '@/shared/theme/AppThemeProvider';
import { formatExactMoney } from '@/shared/utils/money';
import { theme } from '@/shared/theme/theme';

const luminance = (color: string) => {
  const channels =
    color
      .replace('#', '')
      .match(/.{2}/g)
      ?.map(value => {
        const channel = parseInt(value, 16) / 255;
        return channel <= 0.04045
          ? channel / 12.92
          : ((channel + 0.055) / 1.055) ** 2.4;
      }) ?? [];
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
};

test('textul mic din agenda evidentiata pastreaza contrastul minim', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <AppThemeProvider>
        <AgendaBookingCard
          booking={plannerBooking}
          featured
          onOpen={jest.fn()}
        />
      </AppThemeProvider>,
    );
  });
  const background = luminance(theme.colors.menu.selected);
  renderer!.root.findAllByType(InfoRow).forEach(row => {
    const color = StyleSheet.flatten(row.findByType(Text).props.style).color;
    const foreground = luminance(color);
    const contrast =
      (Math.max(background, foreground) + 0.05) /
      (Math.min(background, foreground) + 0.05);
    expect(contrast).toBeGreaterThanOrEqual(4.5);
  });
  await ReactTestRenderer.act(async () => renderer.unmount());
});

test('lista rezervărilor păstrează valoarea contractului, iar agenda ascunde încasările', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <AppThemeProvider>
        <>
          <BookingCard
            booking={plannerBooking}
            eventType="Nuntă"
            onOpen={jest.fn()}
          />
          <AgendaBookingCard booking={plannerBooking} onOpen={jest.fn()} />
        </>
      </AppThemeProvider>,
    );
  });
  const contract = renderer!.root
    .findByType(BookingCard)
    .findAllByType(InfoRow)
    .find(row => row.props.label === 'Valoare contract');
  const received = renderer!.root
    .findByType(AgendaBookingCard)
    .findAllByType(InfoRow)
    .find(row => row.props.label === 'Încasat');
  expect(contract?.props.value).toBe(
    formatExactMoney(plannerBooking.total_amount),
  );
  expect(received).toBeUndefined();
  await ReactTestRenderer.act(async () => renderer.unmount());
});
