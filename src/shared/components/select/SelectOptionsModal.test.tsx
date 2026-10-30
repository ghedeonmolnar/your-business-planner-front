import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { SelectOptionsModal } from '@/shared/components/select/SelectOptionsModal';
import { theme } from '@/shared/theme/theme';

const options = Array.from({ length: 12 }, (_, index) => ({
  id: `option-${index}`,
  name: `Opțiunea ${index}`,
}));

const dialogHeight = (renderer: ReactTestRenderer.ReactTestRenderer) => {
  const panel = renderer.root.find(node => {
    const style = StyleSheet.flatten(node.props.style);
    return (
      style?.borderRadius === theme.radius.lg &&
      typeof style?.maxHeight === 'number'
    );
  });
  return StyleSheet.flatten(panel.props.style)?.maxHeight;
};

const search = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  query: string,
) => {
  const input = renderer.root.findByProps({ accessibilityLabel: 'Caută' });

  await ReactTestRenderer.act(async () => {
    input.props.onChangeText(query);
  });
};

test('hides the search field when every option fits on the screen', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <SafeAreaInsetsContext.Provider
        value={{ top: 0, bottom: 0, left: 0, right: 0 }}
      >
        <SelectOptionsModal
          allowClear={false}
          label="Afișează"
          noItemsText="Nu există opțiuni"
          onChange={() => undefined}
          onClose={() => undefined}
          options={options.slice(0, 3)}
          searchPlaceholder="Caută"
          selectedValues={[]}
          single
          visible
        />
      </SafeAreaInsetsContext.Provider>,
    );
  });

  expect(
    renderer?.root.findAllByProps({ accessibilityLabel: 'Caută' }),
  ).toHaveLength(0);
  expect(
    renderer?.root.findAllByProps({ accessibilityLabel: 'Opțiunea 0' }).length,
  ).toBeGreaterThan(0);

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });
});

test('keeps the dialog height while the search filters the options', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <SafeAreaInsetsContext.Provider
        value={{ top: 0, bottom: 0, left: 0, right: 0 }}
      >
        <SelectOptionsModal
          allowClear
          label="Locație"
          noItemsText="Nu există opțiuni"
          onChange={() => undefined}
          onClose={() => undefined}
          options={options}
          searchPlaceholder="Caută"
          selectedValues={[]}
          single
          visible
        />
      </SafeAreaInsetsContext.Provider>,
    );
  });

  if (!renderer) {
    throw new Error('Nu am putut monta lista de opțiuni.');
  }

  const initialHeight = dialogHeight(renderer);
  expect(initialHeight).toBeGreaterThan(0);
  expect(
    StyleSheet.flatten(renderer.root.findByType(FlatList).props.style),
  ).toMatchObject({ flex: 1 });

  await search(renderer, 'Opțiunea 1');
  expect(dialogHeight(renderer)).toBe(initialHeight);

  await search(renderer, 'fara rezultate');
  expect(dialogHeight(renderer)).toBe(initialHeight);

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });
});
