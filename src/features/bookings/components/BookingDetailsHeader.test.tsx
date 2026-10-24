import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Menu } from 'react-native-paper';
import { BookingDetailsHeader } from '@/features/bookings/components/BookingDetailsHeader';
import { renderWithProviders } from '@/shared/test/renderWithProviders';

test('meniul este închis inițial, se deschide din acțiunea etichetată și se închide la dismiss', async () => {
  const edit = jest.fn();
  const { renderer, unmount } = await renderWithProviders(
    <BookingDetailsHeader
      onBack={jest.fn()}
      onEdit={edit}
      onShare={jest.fn()}
      onCancel={jest.fn()}
      canManage
      canShare
      canCancel
      busy={false}
    />,
  );
  expect(renderer.root.findByType(Menu).props.visible).toBe(false);
  const actions = React.Children.toArray(
    renderer.root.findByType(Menu).props.children,
  ).filter(
    (
      child,
    ): child is React.ReactElement<{
      accessibilityLabel: string;
      onPress: () => void;
      disabled: boolean;
    }> => React.isValidElement(child),
  );
  expect(actions.map(action => action.props.accessibilityLabel)).toEqual([
    'Editează rezervarea',
    'Verifică și trimite pe WhatsApp',
    'Anulează rezervarea',
  ]);
  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: 'Acțiuni rezervare' })
      .props.onPress();
  });
  expect(renderer.root.findByType(Menu).props.visible).toBe(true);
  expect(renderer.root.findByType(Menu).props.overlayAccessibilityLabel).toBe(
    'Închide meniul rezervării',
  );
  await ReactTestRenderer.act(async () => {
    renderer.root.findByType(Menu).props.onDismiss();
  });
  expect(renderer.root.findByType(Menu).props.visible).toBe(false);
  await ReactTestRenderer.act(async () => {
    actions[0].props.onPress();
  });
  expect(edit).toHaveBeenCalledTimes(1);
  await unmount();
});
