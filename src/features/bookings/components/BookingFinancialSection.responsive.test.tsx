import React from 'react';
import * as ReactNative from 'react-native';
import { BookingFinancialSection } from '@/features/bookings/components/BookingFinancialSection';
import { BookingEventSection } from '@/features/bookings/components/BookingEventSection';
import { plannerBooking } from '@/features/bookings/utils/plannerTestFixtures';
import { renderWithProviders } from '@/shared/test/renderWithProviders';

test.each(
  [320, 390, 430].flatMap(width =>
    [1, 1.3, 1.6].map(fontScale => [width, fontScale]),
  ),
)(
  'păstrează valorile accesibile la %s dp și fontScale %s',
  async (width, fontScale) => {
    const dimensions = jest
      .spyOn(ReactNative, 'useWindowDimensions')
      .mockReturnValue({ width, height: 844, scale: 1, fontScale });
    const { renderer, unmount } = await renderWithProviders(
      <>
        <BookingEventSection booking={plannerBooking} canManage />
        <BookingFinancialSection booking={plannerBooking} financeEnabled />
      </>,
    );
    expect(
      renderer.root.findByProps({
        accessibilityLabel:
          'Meniuri confirmate: Numărul exact nu a fost completat',
      }),
    ).toBeDefined();
    expect(
      renderer.root.findByProps({
        accessibilityLabel: 'Rest de încasat: 60.000 lei',
      }),
    ).toBeDefined();
    expect(
      renderer.root
        .findAllByType(ReactNative.Text)
        .some(text => text.props.numberOfLines !== undefined),
    ).toBe(false);
    await unmount();
    dimensions.mockRestore();
  },
);
