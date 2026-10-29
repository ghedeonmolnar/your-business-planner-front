import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { TextInput } from 'react-native-paper';
import { BookingTimePicker } from '@/features/bookings/components/BookingTimePicker';
import { AppButton } from '@/shared/components/AppButton';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { renderWithProviders } from '@/shared/test/renderWithProviders';

const button = (
  renderer: ReactTestRenderer.ReactTestRenderer,
  label: string,
) => {
  const found = renderer.root
    .findAllByProps({ accessibilityLabel: label })
    .find(node => typeof node.props.onPress === 'function');
  if (!found) throw new Error(`Lipsește butonul ${label}.`);
  return found;
};
const confirm = (renderer: ReactTestRenderer.ReactTestRenderer) =>
  renderer.root
    .findAllByType(AppButton)
    .find(
      node =>
        node.props.label?.startsWith('Folosește') ||
        node.props.label === 'Confirmă ora',
    )!;

test('alege ora și minutul separat, acceptă minute exacte și confirmă într-o singură acțiune', async () => {
  const onChange = jest.fn();
  const onClose = jest.fn();
  const { renderer, unmount } = await renderWithProviders(
    <BookingTimePicker
      date="2027-11-13"
      start=""
      value=""
      label="Ora de început"
      onChange={onChange}
      onClose={onClose}
    />,
  );
  try {
    await ReactTestRenderer.act(async () =>
      button(renderer, 'Ora 18').props.onPress(),
    );
    expect(onChange).not.toHaveBeenCalled();
    await ReactTestRenderer.act(async () =>
      renderer.root
        .findAllByType(TextInput)
        .find(
          input => input.props.accessibilityLabel === 'Minut, între 00 și 59',
        )!
        .props.onChangeText('17'),
    );
    expect(confirm(renderer).props.disabled).toBe(false);
    await ReactTestRenderer.act(async () => confirm(renderer).props.onPress());
    expect(onChange).toHaveBeenCalledWith('2027-11-13 18:17');
    expect(onClose).toHaveBeenCalledTimes(1);
  } finally {
    await unmount();
  }
});

test('închiderea nu schimbă ora existentă și o valoare invalidă nu se poate confirma', async () => {
  const onChange = jest.fn();
  const { renderer, unmount } = await renderWithProviders(
    <BookingTimePicker
      date="2027-11-13"
      start=""
      value="2027-11-13 18:17"
      label="Ora de început"
      onChange={onChange}
      onClose={jest.fn()}
    />,
  );
  try {
    await ReactTestRenderer.act(async () =>
      renderer.root
        .findAllByType(TextInput)
        .find(
          input => input.props.accessibilityLabel === 'Oră, între 00 și 23',
        )!
        .props.onChangeText('29'),
    );
    expect(confirm(renderer).props.disabled).toBe(true);
    await ReactTestRenderer.act(async () =>
      renderer.root.findByType(FormModalFrame).props.onClose(),
    );
    expect(onChange).not.toHaveBeenCalled();
  } finally {
    await unmount();
  }
});

test('ora inexistentă nu se confirmă, iar pentru ora repetată se cere alegerea apariției', async () => {
  const first = await renderWithProviders(
    <BookingTimePicker
      date="2026-03-29"
      start=""
      value="2026-03-29 03:30"
      label="Ora de început"
      onChange={jest.fn()}
      onClose={jest.fn()}
    />,
  );
  expect(confirm(first.renderer).props.disabled).toBe(true);
  await first.unmount();
  const onChange = jest.fn();
  const second = await renderWithProviders(
    <BookingTimePicker
      date="2026-10-25"
      start=""
      value="2026-10-25 03:30"
      label="Ora de început"
      onChange={onChange}
      onClose={jest.fn()}
    />,
  );
  try {
    expect(confirm(second.renderer).props.disabled).toBe(true);
    await ReactTestRenderer.act(async () =>
      second.renderer.root
        .findAllByType(AppButton)
        .find(node => node.props.label === '03:30 · a doua apariție')!
        .props.onPress(),
    );
    await ReactTestRenderer.act(async () =>
      confirm(second.renderer).props.onPress(),
    );
    expect(onChange).toHaveBeenCalledWith('2026-10-25 03:30 +02:00');
  } finally {
    await second.unmount();
  }
});
