import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Calendar } from 'react-native-calendars';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { EmployeeForm } from '@/features/employees/components/EmployeeForm';
import { dateToIsoDate } from '@/shared/utils/dateInput';

const insets = { top: 24, right: 0, bottom: 24, left: 0 };

test('folosește calendarul comun pentru data nașterii', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <SafeAreaInsetsContext.Provider value={insets}>
        <EmployeeForm
          onCancel={jest.fn()}
          onSubmit={jest.fn()}
          saving={false}
          visible
        />
      </SafeAreaInsetsContext.Provider>,
    );
  });

  if (!renderer) {
    throw new Error('Nu am putut monta formularul de angajat.');
  }
  const mountedRenderer = renderer;

  await ReactTestRenderer.act(async () => {
    mountedRenderer.root
      .findAllByProps({ accessibilityLabel: 'Data nașterii' })
      .find(node => typeof node.props.onPress === 'function')
      ?.props.onPress();
  });

  const calendar = mountedRenderer.root.findByType(Calendar);

  expect(calendar.props.minDate).toBe('1900-01-01');
  expect(calendar.props.maxDate).toBe(dateToIsoDate(new Date()));

  await ReactTestRenderer.act(async () => {
    mountedRenderer.unmount();
  });
});

test('permite alegerea directă a anului nașterii', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <SafeAreaInsetsContext.Provider value={insets}>
        <EmployeeForm
          onCancel={jest.fn()}
          onSubmit={jest.fn()}
          saving={false}
          visible
        />
      </SafeAreaInsetsContext.Provider>,
    );
  });

  if (!renderer) {
    throw new Error('Nu am putut monta formularul de angajat.');
  }
  const mountedRenderer = renderer;
  const pressByLabel = (label: string) =>
    mountedRenderer.root
      .findAllByProps({ accessibilityLabel: label })
      .find(node => typeof node.props.onPress === 'function')
      ?.props.onPress();

  await ReactTestRenderer.act(async () => pressByLabel('Data nașterii'));
  await ReactTestRenderer.act(async () => pressByLabel('Alege anul'));
  await ReactTestRenderer.act(async () => pressByLabel('Anul 1995'));

  const calendar = mountedRenderer.root.findByType(Calendar);
  expect(calendar.props.current.startsWith('1995-')).toBe(true);

  await ReactTestRenderer.act(async () => {
    calendar.props.onDayPress({ dateString: '1995-05-10' });
  });

  const field = mountedRenderer.root
    .findAllByProps({ accessibilityLabel: 'Data nașterii' })
    .find(node => typeof node.props.onPress === 'function');
  expect(field?.props.accessibilityValue.text).toContain('1995');

  await ReactTestRenderer.act(async () => {
    mountedRenderer.unmount();
  });
});
