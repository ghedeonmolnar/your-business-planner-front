import React, { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native-paper';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { Screen } from '@/shared/components/Screen';

const insets = { top: 24, right: 0, bottom: 48, left: 0 };

const renderScreen = async (wrap: (children: ReactNode) => ReactNode) => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <SafeAreaInsetsContext.Provider value={insets}>
        {wrap(
          <Screen>
            <Text>Conținut</Text>
          </Screen>,
        )}
      </SafeAreaInsetsContext.Provider>,
    );
  });

  const content = renderer?.root.findByProps({ children: 'Conținut' });
  const screenStyle = StyleSheet.flatten(content?.parent?.props.style);

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });

  return screenStyle;
};

test('keeps the system bottom inset outside the tab navigator', async () => {
  const style = await renderScreen(children => children);

  expect(style).toMatchObject({ paddingBottom: 48, paddingTop: 24 });
});

test('drops the bottom inset already reserved by the tab bar', async () => {
  const style = await renderScreen(children => (
    <BottomTabBarHeightContext.Provider value={116}>
      {children}
    </BottomTabBarHeightContext.Provider>
  ));

  expect(style).toMatchObject({ paddingBottom: 0, paddingTop: 24 });
});
