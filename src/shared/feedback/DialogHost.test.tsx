import React from 'react';
import { StyleSheet } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { AppButton } from '@/shared/components/AppButton';
import { AppDialog } from '@/shared/components/AppDialog';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { DialogHost } from '@/shared/feedback/DialogHost';
import { clearDialogs } from '@/shared/feedback/dialogStore';
import { showMessage } from '@/shared/feedback/showMessage';
import {
  getVisibleDialog,
  pressDialogButton,
} from '@/shared/test/renderWithProviders';

const renderHosts = async (element: React.ReactElement) => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(element);
  });

  if (!renderer) {
    throw new Error('Nu am putut monta gazda dialogurilor.');
  }

  return renderer;
};

const openDialog = async (open: () => void) => {
  await ReactTestRenderer.act(async () => {
    open();
  });
};

const dialogTitlesByHost = (renderer: ReactTestRenderer.ReactTestRenderer) =>
  renderer.root
    .findAllByType(AppDialog)
    .map(host => host.props.dialog?.title ?? null);

afterEach(async () => {
  await ReactTestRenderer.act(async () => {
    clearDialogs();
  });
});

test('cancelling closes the dialog without running the action', async () => {
  const onConfirm = jest.fn();
  const renderer = await renderHosts(<DialogHost />);

  await openDialog(() =>
    confirmAction({
      title: 'Ștergi clientul?',
      message: 'Clientul va fi șters.',
      confirmLabel: 'Șterge',
      onConfirm,
    }),
  );

  expect(getVisibleDialog(renderer)).toMatchObject({
    title: 'Ștergi clientul?',
    confirmLabel: 'Șterge',
    cancelLabel: 'Anulează',
  });

  await pressDialogButton(renderer, 'Anulează');

  expect(onConfirm).not.toHaveBeenCalled();
  expect(getVisibleDialog(renderer)).toBeNull();
});

test('confirming closes the dialog and runs the action once', async () => {
  const onConfirm = jest.fn();
  const renderer = await renderHosts(<DialogHost />);

  await openDialog(() =>
    confirmAction({
      title: 'Delogare',
      message: 'Sigur dorești să te deloghezi?',
      confirmLabel: 'Da',
      onConfirm,
    }),
  );
  await pressDialogButton(renderer, 'Da');

  expect(onConfirm).toHaveBeenCalledTimes(1);
  expect(getVisibleDialog(renderer)).toBeNull();
});

test('dialogs requested together are shown one after another', async () => {
  const renderer = await renderHosts(<DialogHost />);

  await openDialog(() => {
    showMessage('Primul mesaj', 'Apare primul.');
    showMessage('Al doilea mesaj', 'Așteaptă primul răspuns.');
  });

  expect(getVisibleDialog(renderer)?.title).toBe('Primul mesaj');

  await pressDialogButton(renderer, 'OK');

  expect(getVisibleDialog(renderer)?.title).toBe('Al doilea mesaj');

  await pressDialogButton(renderer, 'OK');

  expect(getVisibleDialog(renderer)).toBeNull();
});

test('the dialog opens in the host of the modal shown on top', async () => {
  const renderScreen = (modalOpen: boolean) => (
    <>
      <DialogHost />
      {modalOpen ? <DialogHost /> : null}
    </>
  );
  const renderer = await renderHosts(renderScreen(true));

  await openDialog(() => showMessage('Eroare', 'Nu am putut salva.'));

  expect(dialogTitlesByHost(renderer)).toEqual([null, 'Eroare']);

  await ReactTestRenderer.act(async () => {
    renderer.update(renderScreen(false));
  });

  expect(dialogTitlesByHost(renderer)).toEqual(['Eroare']);
});

test('dialog buttons share one width and sit side by side when they fit', async () => {
  const renderer = await renderHosts(<DialogHost />);

  await openDialog(() =>
    confirmAction({
      title: 'Delogare',
      message: 'Sigur dorești să te deloghezi din aplicație?',
      confirmLabel: 'Da',
      cancelLabel: 'Nu',
      onConfirm: jest.fn(),
    }),
  );

  const buttons = renderer.root.findAllByType(AppButton);
  const actions = buttons[0].parent;

  expect(buttons.map(button => button.props.label)).toEqual(['Da', 'Nu']);
  buttons.forEach(button => {
    expect(button.props.sizingLabels).toEqual(['Da', 'Nu']);
    expect(StyleSheet.flatten(button.props.style)).toMatchObject({
      flexGrow: 1,
    });
  });
  expect(StyleSheet.flatten(actions?.props.style)).toMatchObject({
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
  });
});

test('a message with one button uses the whole row', async () => {
  const renderer = await renderHosts(<DialogHost />);

  await openDialog(() => showMessage('Cod trimis', 'Verifică emailul.'));

  const [button] = renderer.root.findAllByType(AppButton);

  expect(renderer.root.findAllByType(AppButton)).toHaveLength(1);
  expect(button.props.sizingLabels).toEqual(['OK']);
  expect(StyleSheet.flatten(button.props.style)).toMatchObject({
    flexGrow: 1,
  });
});
