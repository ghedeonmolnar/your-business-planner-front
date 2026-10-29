import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { AppDialog } from '@/shared/components/AppDialog';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { Surface, Text } from 'react-native-paper';
import { AppThemeProvider } from '@/shared/theme/AppThemeProvider';

test('confirmarea rămâne compactă și plafonul ei este separat de formularul principal', async () => {
  const render = (busy: boolean) => (
    <AppThemeProvider>
      <SafeAreaInsetsContext.Provider
        value={{ top: 0, bottom: 0, left: 0, right: 0 }}
      >
        <FormModalFrame visible title="Rezervare" onClose={jest.fn()}>
          <Text>Formular</Text>
        </FormModalFrame>
        <AppDialog
          busy={busy}
          dialog={{
            title: 'Modificări nesalvate',
            message: 'Modificările se vor pierde.',
            confirmLabel: 'Pleacă fără să salvezi',
            cancelLabel: 'Rămâi în formular',
          }}
          onCancel={jest.fn()}
          onConfirm={jest.fn()}
        />
      </SafeAreaInsetsContext.Provider>
    </AppThemeProvider>
  );
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(render(false));
  });
  if (!renderer) throw new Error('Nu am putut deschide confirmarea.');
  const view = renderer;
  const panel = (component: typeof AppDialog | typeof FormModalFrame) => {
    const host =
      component === AppDialog
        ? view.root.findAllByType(AppDialog).find(node => node.props.dialog)
        : view.root.findByType(FormModalFrame);
    if (!host) throw new Error('Nu am putut găsi dialogul.');
    const surface = host
      .findAllByType(Surface)
      .find(
        node =>
          typeof StyleSheet.flatten(node.props.style)?.maxHeight === 'number',
      );
    if (!surface) throw new Error('Nu am putut găsi panoul dialogului.');
    return surface;
  };
  const dialogStyle = StyleSheet.flatten(panel(AppDialog).props.style);
  expect(dialogStyle.flex).toBeUndefined();
  expect(dialogStyle.flexShrink).toBe(1);
  expect(dialogStyle.maxHeight).toBeLessThan(
    StyleSheet.flatten(panel(FormModalFrame).props.style).maxHeight,
  );
  expect(
    StyleSheet.flatten(panel(AppDialog).findByType(ScrollView).props.style),
  ).toMatchObject({ flexGrow: 0, flexShrink: 1 });
  await ReactTestRenderer.act(async () => view.update(render(true)));
  expect(StyleSheet.flatten(panel(AppDialog).props.style).maxHeight).toBe(
    dialogStyle.maxHeight,
  );
  await ReactTestRenderer.act(async () => view.unmount());
});
