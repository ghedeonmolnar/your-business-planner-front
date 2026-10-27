import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { CalendarMonth } from '@/features/bookings/components/CalendarMonth';
import { CalendarMonthList } from '@/features/bookings/components/CalendarMonthList';
import { renderedText } from '@/shared/test/renderedText';

jest.mock('@/shared/hooks/useSingleColumnLayout', () => ({
  useSingleColumnLayout: () => true,
}));

test('alternativa cu font mare pastreaza selectia si distinge datele lipsa de o zi libera', async () => {
  const select = jest.fn();
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <CalendarMonth
        month="2028-02"
        selected="2028-02-01"
        onSelect={select}
        days={[{ date: '2028-02-01', confirmed: 0, tentative: 0, free: 2 }]}
      />,
    );
  });
  if (!renderer) throw new Error('Calendar indisponibil');
  expect(renderer.root.findAllByType(CalendarMonthList)).toHaveLength(1);
  expect(renderedText(renderer)).toContain('Liber · 2 săli libere');
  expect(renderedText(renderer)).toContain('Date indisponibile');
  await ReactTestRenderer.act(async () =>
    renderer?.root
      .findByProps({ testID: 'calendar-day:2028-02-29' })
      .props.onPress(),
  );
  expect(select).toHaveBeenCalledWith('2028-02-29');
  await ReactTestRenderer.act(async () => renderer?.unmount());
});
