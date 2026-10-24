import React from 'react';
import { Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import ReactTestRenderer from 'react-test-renderer';
import { MetaPill } from '@/shared/components/MetaPill';

test('indicatorul permite text lung și eliminarea filtrului printr-o acțiune etichetată', async () => {
  const remove = jest.fn();
  const label = 'Un interval de evenimente cu o descriere suficient de lungă';
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <MetaPill
        label={label}
        tone="primary"
        onRemove={remove}
        removeLabel="Elimină intervalul"
      />,
    );
  });
  expect(renderer!.root.findByType(Text).props.numberOfLines).toBeUndefined();
  const action = renderer!.root.findByType(Pressable);
  expect(action.props.accessibilityLabel).toBe('Elimină intervalul');
  await ReactTestRenderer.act(async () => action.props.onPress());
  expect(remove).toHaveBeenCalledTimes(1);
  await ReactTestRenderer.act(async () => renderer.unmount());
});
