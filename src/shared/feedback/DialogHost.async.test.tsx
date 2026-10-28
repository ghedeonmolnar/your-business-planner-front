import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { AppDialog } from '@/shared/components/AppDialog';
import { AppButton } from '@/shared/components/AppButton';
import { DialogHost } from '@/shared/feedback/DialogHost';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { clearDialogs } from '@/shared/feedback/dialogStore';
import { AppThemeProvider } from '@/shared/theme/AppThemeProvider';
import { getVisibleDialog } from '@/shared/test/renderWithProviders';

test('confirmarea asincronă păstrează dialogul, arată loaderul și blochează anularea până la final', async () => {
  let finish: (() => void) | undefined;
  const operation = new Promise<void>(resolve => {
    finish = resolve;
  });
  const onConfirm = jest.fn(() => operation);
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <AppThemeProvider>
        <DialogHost />
      </AppThemeProvider>,
    );
    confirmAction({
      title: 'Ștergi înregistrarea?',
      message: 'Confirmă ștergerea.',
      confirmLabel: 'Șterge',
      onConfirm,
    });
  });
  const dialog = () => renderer.root.findByType(AppDialog);
  try {
    await ReactTestRenderer.act(async () => {
      void dialog().props.onConfirm();
      void dialog().props.onConfirm();
    });
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(getVisibleDialog(renderer!)).not.toBeNull();
    expect(
      dialog()
        .findAllByType(AppButton)
        .find(button => button.props.label === 'Șterge')?.props.loading,
    ).toBe(true);
    expect(
      dialog()
        .findAllByType(AppButton)
        .find(button => button.props.label === 'Anulează')?.props.disabled,
    ).toBe(true);
    await ReactTestRenderer.act(async () => dialog().props.onCancel());
    expect(getVisibleDialog(renderer!)).not.toBeNull();
    await ReactTestRenderer.act(async () => {
      finish?.();
      await operation;
    });
    expect(getVisibleDialog(renderer!)).toBeNull();
  } finally {
    finish?.();
    await ReactTestRenderer.act(async () => {
      renderer!.unmount();
      clearDialogs();
    });
  }
});
