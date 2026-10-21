import React from 'react';
import { StyleSheet } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native-paper';
import { AppButton } from '@/shared/components/AppButton';

test('keeps the icon and label centered as one content group', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <AppButton
        icon="add"
        label="Angajat"
        onPress={() => undefined}
        variant="outline"
      />,
    );
  });

  const button = renderer?.root.findByProps({ accessibilityRole: 'button' });
  const content = button?.find(node => {
    const style = StyleSheet.flatten(node.props.style);

    return (
      style?.alignItems === 'center' &&
      style?.flexDirection === 'row' &&
      style?.justifyContent === 'center'
    );
  });

  expect(StyleSheet.flatten(content?.props.style)).toMatchObject({
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  });
  expect(content?.findByProps({ name: 'add' })).toBeDefined();
  expect(content?.findByProps({ children: 'Angajat' })).toBeDefined();

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });
});

test('reserves the width of the widest sizing label without showing or announcing it', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <AppButton
        label="Nu"
        onPress={() => undefined}
        sizingLabels={['Da', 'Nu']}
      />,
    );
  });

  const button = renderer?.root.findByProps({ accessibilityRole: 'button' });
  const hiddenLabels = renderer?.root.findByProps({
    importantForAccessibility: 'no-hide-descendants',
  });

  expect(button?.props.accessibilityLabel).toBe('Nu');
  expect(hiddenLabels?.props.accessibilityElementsHidden).toBe(true);
  expect(StyleSheet.flatten(hiddenLabels?.props.style)).toMatchObject({
    height: 0,
    opacity: 0,
    overflow: 'hidden',
  });
  expect(
    hiddenLabels?.findAllByType(Text).map(label => label.props.children),
  ).toEqual(['Da', 'Nu']);

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });
});
