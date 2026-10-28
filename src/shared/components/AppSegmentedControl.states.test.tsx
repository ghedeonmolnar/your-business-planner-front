import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { TouchableRipple } from 'react-native-paper';
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
  const segment = (label: string) =>
    renderer.root
      .findAllByType(TouchableRipple)
      .find(button => button.props.accessibilityLabel === label)!;
  expect(segment('Toate').props.accessibilityState.selected).toBe(true);
  expect(segment('Viitoare').props.disabled).toBe(true);
  await ReactTestRenderer.act(async () => segment('Viitoare').props.onPress());
  expect(onChange).not.toHaveBeenCalled();
  await ReactTestRenderer.act(async () => renderer.update(render(false)));
  await ReactTestRenderer.act(async () => {
    segment('Trecute').props.onPress();
  });
  expect(onChange).not.toHaveBeenCalled();
  expect(segment('Trecute').props.disabled).toBe(true);
  expect(segment('Viitoare').props.disabled).toBe(false);
  await ReactTestRenderer.act(async () => segment('Viitoare').props.onPress());
  expect(onChange).toHaveBeenCalledWith(1);
  await ReactTestRenderer.act(async () => renderer.unmount());
});
