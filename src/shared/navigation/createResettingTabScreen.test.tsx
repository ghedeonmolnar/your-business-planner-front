import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import ReactTestRenderer from 'react-test-renderer';
import { createResettingTabScreen } from '@/shared/navigation/createResettingTabScreen';

let mockIsFocused = true;

jest.mock('@react-navigation/native', () => ({
  useIsFocused: () => mockIsFocused,
}));

function StatefulScreen() {
  const [value, setValue] = useState(0);

  return (
    <Pressable accessibilityLabel="Schimbă starea" onPress={() => setValue(1)}>
      <Text testID="screen-value">{value}</Text>
    </Pressable>
  );
}

const ResettingScreen = createResettingTabScreen(StatefulScreen);

test('remontează ecranul cu starea implicită după pierderea focusului', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<ResettingScreen />);
  });

  await ReactTestRenderer.act(async () => {
    renderer?.root
      .findByProps({ accessibilityLabel: 'Schimbă starea' })
      .props.onPress();
  });
  expect(
    renderer?.root.findByProps({ testID: 'screen-value' }).props.children,
  ).toBe(1);

  mockIsFocused = false;
  await ReactTestRenderer.act(async () => {
    renderer?.update(<ResettingScreen />);
  });

  mockIsFocused = true;
  await ReactTestRenderer.act(async () => {
    renderer?.update(<ResettingScreen />);
  });

  expect(
    renderer?.root.findByProps({ testID: 'screen-value' }).props.children,
  ).toBe(0);

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });
});
