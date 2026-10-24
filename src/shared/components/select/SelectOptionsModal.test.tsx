import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { SelectOptionsModal } from '@/shared/components/select/SelectOptionsModal';

const options = Array.from({ length: 12 }, (_, index) => ({
  id: `option-${index}`,
  name: `Opțiunea ${index}`,
}));

const listHeight = (renderer: ReactTestRenderer.ReactTestRenderer) =>
  StyleSheet.flatten(renderer.root.findByType(FlatList).props.style)?.maxHeight;

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
      />,
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
      />,
    );
  });

  if (!renderer) {
    throw new Error('Nu am putut monta lista de opțiuni.');
  }

  const initialHeight = listHeight(renderer);
  expect(initialHeight).toBeGreaterThan(0);

  await search(renderer, 'Opțiunea 1');
  expect(listHeight(renderer)).toBe(initialHeight);

  await search(renderer, 'fara rezultate');
  expect(listHeight(renderer)).toBe(initialHeight);

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });
});
