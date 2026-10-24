import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Switch } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { ControlledSwitchField } from '@/shared/components/ControlledSwitchField';
import { FormInteractionContext } from '@/shared/components/FormInteractionContext';
import { AppThemeProvider } from '@/shared/theme/AppThemeProvider';
import { renderedText } from '@/shared/test/renderedText';

function SwitchForm({ busy }: { busy: boolean }) {
  const form = useForm({ defaultValues: { vat: true } });
  return (
    <AppThemeProvider>
      <FormInteractionContext.Provider value={busy}>
        <ControlledSwitchField
          control={form.control}
          name="vat"
          label="Statut TVA"
          activeText="Plătitoare de TVA"
          inactiveText="Neplătitoare de TVA"
        />
      </FormInteractionContext.Provider>
    </AppThemeProvider>
  );
}

test('switch-ul păstrează valoarea în timpul salvării și respectă eticheta originală', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<SwitchForm busy />);
  });
  expect(renderedText(renderer!)).toContain('Statut TVA');
  const field = () => renderer.root.findByType(Switch);
  expect(field().props.disabled).toBe(true);
  await ReactTestRenderer.act(async () => field().props.onValueChange(false));
  expect(field().props.value).toBe(true);
  await ReactTestRenderer.act(async () =>
    renderer.update(<SwitchForm busy={false} />),
  );
  await ReactTestRenderer.act(async () => field().props.onValueChange(false));
  expect(field().props.value).toBe(false);
  await ReactTestRenderer.act(async () => renderer.unmount());
});
