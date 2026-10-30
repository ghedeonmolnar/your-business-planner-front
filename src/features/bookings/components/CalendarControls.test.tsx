import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Modal, ScrollView } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { CalendarControls } from '@/features/bookings/components/CalendarControls';
import { CalendarPeriodPicker } from '@/features/bookings/components/CalendarPeriodPicker';
import { useCalendarNavigation } from '@/features/bookings/hooks/useCalendarNavigation';
import { AppButton } from '@/shared/components/AppButton';
import { IconButton } from '@/shared/components/IconButton';
import { SelectFieldTrigger } from '@/shared/components/select/SelectFieldTrigger';
import { SelectOptionRow } from '@/shared/components/select/SelectOptionRow';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useIsFocused: () => true,
}));

function CalendarNavigation() {
  const navigation = useCalendarNavigation();
  return (
    <SafeAreaInsetsContext.Provider
      value={{ top: 0, bottom: 0, left: 0, right: 0 }}
    >
      <CalendarControls
        period={navigation.period}
        selected={navigation.selected}
        hallId="hall-1"
        halls={[{ id: 'hall-1', name: 'Sala test', is_active: true }]}
        onPeriod={navigation.setPeriod}
        onMove={navigation.move}
        onHall={() => undefined}
        onSelectMonth={navigation.selectMonth}
      />
    </SafeAreaInsetsContext.Provider>
  );
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-08-28T12:00:00Z'));
});

afterEach(() => jest.useRealTimers());

test('deschide sub titlu perioada curentă și listele preselectate, apoi aplică luna aleasă', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<CalendarNavigation />);
  });
  const root = renderer!.root;
  const periodTrigger = () =>
    root.findByProps({ accessibilityLabel: 'Alege luna și anul' });
  const field = (label: string) =>
    root
      .findAllByType(SelectFieldTrigger)
      .find(node => node.props.accessibilityLabel === label)!;

  try {
    expect(root.findByType(CalendarControls).props.selected).toBe('2026-08-28');
    await ReactTestRenderer.act(async () => periodTrigger().props.onPress());
    const picker = root.findByType(CalendarPeriodPicker);
    expect(picker.findAllByType(Modal)).toHaveLength(0);
    expect(periodTrigger().props.accessibilityState.expanded).toBe(true);
    expect(field('An').props.accessibilityValueText).toBe('2026');
    expect(field('Lună').props.accessibilityValueText).toBe('August');

    await ReactTestRenderer.act(async () => field('An').props.onPress());
    expect(picker.findByType(ScrollView).props.nestedScrollEnabled).toBe(true);
    expect(
      picker.findAllByType(SelectOptionRow).find(row => row.props.selected)
        ?.props.option.id,
    ).toBe('2026');
    await ReactTestRenderer.act(async () => field('Lună').props.onPress());
    expect(field('An').props.expanded).toBe(false);
    expect(
      picker.findAllByType(SelectOptionRow).find(row => row.props.selected)
        ?.props.option.id,
    ).toBe('08');

    await ReactTestRenderer.act(async () => {
      const february = picker
        .findAllByType(SelectOptionRow)
        .find(row => row.props.option.id === '02')!;
      february.props.onPress(february.props.option);
    });
    expect(field('Lună').props.expanded).toBe(false);
    await ReactTestRenderer.act(async () => field('An').props.onPress());
    await ReactTestRenderer.act(async () => {
      const year = picker
        .findAllByType(SelectOptionRow)
        .find(row => row.props.option.id === '2027')!;
      year.props.onPress(year.props.option);
    });
    expect(root.findByType(CalendarControls).props.selected).toBe('2026-08-28');
    await ReactTestRenderer.act(async () => {
      picker.findByType(AppButton).props.onPress();
    });
    expect(root.findAllByType(CalendarPeriodPicker)).toHaveLength(0);
    expect(root.findByType(CalendarControls).props.selected).toBe('2027-02-28');
    await ReactTestRenderer.act(async () => periodTrigger().props.onPress());
    expect(field('An').props.accessibilityValueText).toBe('2027');
    expect(field('Lună').props.accessibilityValueText).toBe('Februarie');
  } finally {
    await ReactTestRenderer.act(async () => renderer!.unmount());
  }
});

test('închiderea fără aplicare elimină selecția provizorie, iar săgețile închid dropdownul', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<CalendarNavigation />);
  });
  const root = renderer!.root;
  const trigger = (label: string) =>
    root.findByProps({ accessibilityLabel: label });

  try {
    await ReactTestRenderer.act(async () =>
      trigger('Alege luna și anul').props.onPress(),
    );
    await ReactTestRenderer.act(async () => {
      root
        .findAllByType(SelectFieldTrigger)
        .find(node => node.props.accessibilityLabel === 'Lună')!
        .props.onPress();
    });
    await ReactTestRenderer.act(async () => {
      const december = root
        .findAllByType(SelectOptionRow)
        .find(row => row.props.option.id === '12')!;
      december.props.onPress(december.props.option);
    });
    await ReactTestRenderer.act(async () =>
      trigger('Alege luna și anul').props.onPress(),
    );
    expect(root.findAllByType(CalendarPeriodPicker)).toHaveLength(0);
    expect(root.findByType(CalendarControls).props.selected).toBe('2026-08-28');
    await ReactTestRenderer.act(async () =>
      trigger('Alege luna și anul').props.onPress(),
    );
    expect(
      root
        .findAllByType(SelectFieldTrigger)
        .find(node => node.props.accessibilityLabel === 'Lună')!.props
        .accessibilityValueText,
    ).toBe('August');
    await ReactTestRenderer.act(async () => {
      root
        .findAllByType(IconButton)
        .find(node => node.props.accessibilityLabel === 'Perioada următoare')!
        .props.onPress();
    });
    expect(root.findAllByType(CalendarPeriodPicker)).toHaveLength(0);
    expect(root.findByType(CalendarControls).props.selected).toBe('2026-09-28');
  } finally {
    await ReactTestRenderer.act(async () => renderer!.unmount());
  }
});
