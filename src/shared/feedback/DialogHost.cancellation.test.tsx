import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { AppDialog } from '@/shared/components/AppDialog';
import { DialogHost } from '@/shared/feedback/DialogHost';
import { clearDialogs, showDialog } from '@/shared/feedback/dialogStore';
import { advanceSessionGeneration } from '@/shared/api/sessionExpiry';
import { getVisibleDialog } from '@/shared/test/renderWithProviders';

const renderHost = async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <SafeAreaInsetsContext.Provider
        value={{ top: 0, bottom: 0, left: 0, right: 0 }}
      >
        <DialogHost />
      </SafeAreaInsetsContext.Provider>,
    );
  });
  if (!renderer) throw new Error('Gazda dialogurilor nu a fost montata.');
  return renderer;
};

afterEach(() => clearDialogs());

test('async cancellation runs once and blocks the other action until completion', async () => {
  let finish: () => void = () => undefined;
  const pending = new Promise<void>(resolve => {
    finish = resolve;
  });
  const onCancel = jest.fn(() => pending);
  const onConfirm = jest.fn();
  const renderer = await renderHost();
  try {
    await ReactTestRenderer.act(async () => {
      showDialog({
        title: 'Invitație',
        message: 'Alege acțiunea.',
        confirmLabel: 'Am înțeles',
        onCancel,
        onConfirm,
      });
    });
    const dialog = () => renderer.root.findByType(AppDialog);
    await ReactTestRenderer.act(async () => {
      void dialog().props.onCancel();
      void dialog().props.onCancel();
      void dialog().props.onConfirm();
    });
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
    expect(dialog().props.busy).toBe(true);
    expect(getVisibleDialog(renderer)).not.toBeNull();
    await ReactTestRenderer.act(async () => {
      finish();
      await pending;
    });
    expect(getVisibleDialog(renderer)).toBeNull();
  } finally {
    finish();
    await ReactTestRenderer.act(async () => renderer.unmount());
  }
});

test('a cancellation callback from an old session cannot navigate in the new session', async () => {
  const onCancel = jest.fn();
  const renderer = await renderHost();
  await ReactTestRenderer.act(async () => {
    showDialog({
      title: 'Confirmare',
      message: 'Parolă actualizată.',
      confirmLabel: 'Înapoi',
      onCancel,
    });
  });
  const previousCancel = renderer.root.findByType(AppDialog).props.onCancel;
  await ReactTestRenderer.act(async () => advanceSessionGeneration());
  await ReactTestRenderer.act(async () => {
    await previousCancel();
  });
  expect(onCancel).not.toHaveBeenCalled();
  expect(getVisibleDialog(renderer)).toBeNull();
  await ReactTestRenderer.act(async () => renderer.unmount());
});
