import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { SelectOptionsModal } from '@/shared/components/select/SelectOptionsModal';
import { SelectOptionRow } from '@/shared/components/select/SelectOptionRow';
import { SearchField } from '@/shared/components/SearchField';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { AppButton } from '@/shared/components/AppButton';
import { AppThemeProvider } from '@/shared/theme/AppThemeProvider';
import { renderedText } from '@/shared/test/renderedText';

const options = Array.from({ length: 8 }, (_, index) => ({
  id: String(index),
  name: `Opțiunea ${index}`,
}));

test('încărcarea paginii următoare păstrează căutarea și selecția multiplă neconfirmată', async () => {
  const onChange = jest.fn();
  const render = (more: boolean) => (
    <AppThemeProvider>
      <SafeAreaInsetsContext.Provider
        value={{ top: 0, bottom: 0, left: 0, right: 0 }}
      >
        <SelectOptionsModal
          visible
          single={false}
          allowClear
          label="Persoane"
          searchPlaceholder="Caută persoane"
          noItemsText="Nu există persoane"
          options={
            more ? [...options, { id: '8', name: 'Opțiunea 8' }] : options
          }
          selectedValues={[]}
          onChange={onChange}
          onClose={jest.fn()}
        />
      </SafeAreaInsetsContext.Provider>
    </AppThemeProvider>
  );
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(render(false));
  });
  await ReactTestRenderer.act(async () =>
    renderer.root.findAllByType(SelectOptionRow)[0].props.onPress(options[0]),
  );
  await ReactTestRenderer.act(async () =>
    renderer.root.findByType(SearchField).props.onChange('Opțiunea'),
  );
  await ReactTestRenderer.act(async () => renderer.update(render(true)));
  expect(renderer!.root.findByType(SearchField).props.value).toBe('Opțiunea');
  expect(renderer!.root.findAllByType(SelectOptionRow)[0].props.selected).toBe(
    true,
  );
  await ReactTestRenderer.act(async () =>
    renderer.root
      .findAllByType(AppButton)
      .find(button => button.props.label === 'Confirmă')
      ?.props.onPress(),
  );
  expect(onChange).toHaveBeenCalledWith(['0']);
  await ReactTestRenderer.act(async () => renderer.unmount());
});

test('încărcarea și eroarea opțiunilor nu apar ca listă goală', async () => {
  const retry = jest.fn();
  const render = (loading: boolean, error?: Error) => (
    <AppThemeProvider>
      <SafeAreaInsetsContext.Provider
        value={{ top: 0, bottom: 0, left: 0, right: 0 }}
      >
        <SelectOptionsModal
          visible
          single
          allowClear={false}
          label="Săli"
          searchPlaceholder="Caută sala"
          noItemsText="Nu există săli"
          options={[]}
          selectedValues={[]}
          onChange={jest.fn()}
          onClose={jest.fn()}
          optionsState={{ loading, error, onRetry: retry }}
        />
      </SafeAreaInsetsContext.Provider>
    </AppThemeProvider>
  );
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(render(true));
  });
  expect(renderer!.root.findAllByType(LoadingState)).toHaveLength(1);
  expect(renderedText(renderer!)).not.toContain('Nu există săli');
  await ReactTestRenderer.act(async () =>
    renderer.update(render(false, new Error('Conexiune întreruptă'))),
  );
  expect(renderedText(renderer!)).not.toContain('Nu există săli');
  await ReactTestRenderer.act(async () =>
    renderer.root.findByType(ErrorBanner).props.onRetry(),
  );
  expect(retry).toHaveBeenCalledTimes(1);
  await ReactTestRenderer.act(async () => renderer.unmount());
});
