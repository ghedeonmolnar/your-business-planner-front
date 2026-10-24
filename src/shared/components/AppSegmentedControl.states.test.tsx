import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SegmentedButtons } from 'react-native-paper';
import { AppSegmentedControl } from '@/shared/components/AppSegmentedControl';
import { FormInteractionContext } from '@/shared/components/FormInteractionContext';
import { AppThemeProvider } from '@/shared/theme/AppThemeProvider';

test('selecția respectă blocarea formularului și opțiunile indisponibile', async () => {
  const onChange = jest.fn();
  const render = (busy: boolean) => (
    <AppThemeProvider>
      <FormInteractionContext.Provider value={busy}>
        <AppSegmentedControl
          selectedIndex={0}
          onChangeIndex={onChange}
          segments={[
            { label: 'Toate' },
            { label: 'Viitoare' },
            { label: 'Trecute', disabled: true },
          ]}
        />
      </FormInteractionContext.Provider>
    </AppThemeProvider>
  );
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(render(true));
  });
  const field = () => renderer.root.findByType(SegmentedButtons);
  expect(field().props.value).toBe('0');
  await ReactTestRenderer.act(async () => field().props.onValueChange('1'));
  expect(onChange).not.toHaveBeenCalled();
  await ReactTestRenderer.act(async () => renderer.update(render(false)));
  await ReactTestRenderer.act(async () => {
    field().props.onValueChange('2');
    field().props.onValueChange('99');
  });
  expect(onChange).not.toHaveBeenCalled();
  await ReactTestRenderer.act(async () => field().props.onValueChange('1'));
  expect(onChange).toHaveBeenCalledWith(1);
  await ReactTestRenderer.act(async () => renderer.unmount());
});
