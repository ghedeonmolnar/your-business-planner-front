import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { PaymentForm } from '@/features/events/components/PaymentForm';
import { AppSegmentedControl } from '@/shared/components/AppSegmentedControl';
import { EventPaymentPayload } from '@/features/events/types';
import { PaymentOvertimeForm } from '@/features/events/components/PaymentOvertimeForm';
import { eventFixture } from '@/shared/test/apiFixtures';

const insets = { top: 24, right: 0, bottom: 24, left: 0 };

export const renderForm = async (
  onSubmit: (values: EventPaymentPayload) => void,
  props: Partial<React.ComponentProps<typeof PaymentForm>> = {},
) => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <SafeAreaInsetsContext.Provider value={insets}>
        <PaymentForm
          event={{
            ...eventFixture,
            employee_ids: ['employee-1', 'employee-2'],
          }}
          defaultAmount={500}
          eventRating={null}
          onCancel={() => undefined}
          onSubmit={onSubmit}
          saving={false}
          visible
          {...props}
        />
      </SafeAreaInsetsContext.Provider>,
    );
  });

  if (!renderer) {
    throw new Error('Nu am putut monta formularul de plată.');
  }

  return renderer;
};

export const press = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  accessibilityLabel: string,
) => {
  const pressable = renderer.root
    .findAllByProps({ accessibilityLabel })
    .find(node => typeof node.props.onPress === 'function');

  await ReactTestRenderer.act(async () => {
    pressable?.props.onPress();
  });
};

export const selectSettlement = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  index: number,
) => {
  const segmented = renderer.root.findByType(AppSegmentedControl);

  await ReactTestRenderer.act(async () => {
    segmented.props.onChangeIndex(index);
  });
};

export const submit = async (renderer: ReactTestRenderer.ReactTestRenderer) => {
  const saveButton = renderer.root
    .findAllByProps({ label: 'Salvează' })
    .find(node => typeof node.props.onPress === 'function');

  await ReactTestRenderer.act(async () => {
    await saveButton?.props.onPress();
  });

  if (renderer.root.findAllByType(PaymentOvertimeForm).length > 0) {
    await saveOvertime(renderer);
  }
};

export const saveOvertime = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
) => {
  const button = renderer.root
    .findAllByProps({ label: 'Salvează plata' })
    .find(node => typeof node.props.onPress === 'function');

  await ReactTestRenderer.act(async () => {
    await button?.props.onPress();
  });
};

export const selectField = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  label: string,
  values: string[],
) => {
  const field = renderer.root
    .findAllByProps({ label })
    .find(node => typeof node.props.onChange === 'function');

  if (!field) {
    throw new Error(`Câmpul ${label} lipsește.`);
  }

  await ReactTestRenderer.act(async () => field.props.onChange(values));
};

export const enterText = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  accessibilityLabel: string,
  value: string,
) => {
  const input = renderer.root
    .findAllByProps({ accessibilityLabel })
    .find(node => typeof node.props.onChangeText === 'function');

  if (!input) {
    throw new Error(`Câmpul ${accessibilityLabel} lipsește.`);
  }

  await ReactTestRenderer.act(async () => input.props.onChangeText(value));
};
