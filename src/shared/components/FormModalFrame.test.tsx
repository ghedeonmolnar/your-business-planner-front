import React from 'react';
import { Dimensions, ScrollView, StyleSheet } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native-paper';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { AppDialog } from '@/shared/components/AppDialog';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { IconButton } from '@/shared/components/IconButton';
import { clearDialogs } from '@/shared/feedback/dialogStore';
import { useKeyboardOverlap } from '@/shared/hooks/useKeyboardOverlap';
import { theme } from '@/shared/theme/theme';

jest.mock('@/shared/hooks/useKeyboardOverlap', () => ({
  useKeyboardOverlap: jest.fn(() => 0),
}));

const insets = { top: 24, right: 0, bottom: 48, left: 0 };
const windowHeight = Dimensions.get('window').height;
const modalTop = insets.top + theme.spacing.lg;

const renderFrame = async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <SafeAreaInsetsContext.Provider value={insets}>
        <FormModalFrame
          footer={<Text>Salvează</Text>}
          onClose={() => undefined}
          title="Client nou"
          visible
        >
          <Text>Formular</Text>
        </FormModalFrame>
      </SafeAreaInsetsContext.Provider>,
    );
  });

  const modalBox = renderer?.root.find(node => {
    const style = StyleSheet.flatten(node.props.style);

    return (
      typeof style?.maxHeight === 'number' &&
      style?.borderRadius === theme.radius.lg
    );
  });

  const maxHeight = StyleSheet.flatten(modalBox?.props.style)?.maxHeight;

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });

  return maxHeight;
};

beforeEach(() => {
  (useKeyboardOverlap as jest.Mock).mockReturnValue(0);
  clearDialogs();
});

test('opens at 90% of the window height while the keyboard is hidden', async () => {
  expect(await renderFrame()).toBe(Math.round(windowHeight * 0.9));
});

test('stops above the keyboard so the focused input stays visible', async () => {
  const keyboardOverlap = Math.round(windowHeight * 0.4);
  (useKeyboardOverlap as jest.Mock).mockReturnValue(keyboardOverlap);

  expect(await renderFrame()).toBe(
    windowHeight - modalTop - keyboardOverlap - theme.spacing.sm,
  );
});

test('caps the dialog at the space left when the keyboard covers almost everything', async () => {
  (useKeyboardOverlap as jest.Mock).mockReturnValue(windowHeight - 60);

  expect(await renderFrame()).toBe(
    Math.max(0, 60 - modalTop - theme.spacing.sm),
  );
});

test('păstrează aceeași înălțime când pașii au conținut diferit', async () => {
  const renderStep = (step: number, title: string, content: string) => (
    <SafeAreaInsetsContext.Provider value={insets}>
      <FormModalFrame
        visible
        title={title}
        progress={{ current: step, total: 3 }}
        onClose={() => undefined}
        footer={<Text>Continuă</Text>}
      >
        <Text>{content}</Text>
      </FormModalFrame>
    </SafeAreaInsetsContext.Provider>
  );
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      renderStep(1, 'Sală și program', 'Câmpuri pentru sală și program'),
    );
  });
  if (!renderer) throw new Error('Nu am putut deschide formularul.');
  const view = renderer;
  const panelStyle = () => {
    const panel = view.root.find(node => {
      const style = StyleSheet.flatten(node.props.style);
      return (
        style?.borderRadius === theme.radius.lg &&
        typeof style?.maxHeight === 'number'
      );
    });
    return StyleSheet.flatten(panel.props.style);
  };
  try {
    const initialHeight = panelStyle()?.maxHeight;
    expect(panelStyle()?.flex).toBe(1);
    for (const [step, title, content] of [
      [2, 'Client', 'Telefon'],
      [3, 'Condiții comerciale', 'Servicii suplimentare '.repeat(30)],
    ] as const) {
      await ReactTestRenderer.act(async () =>
        view.update(renderStep(step, title, content)),
      );
      expect(panelStyle()?.maxHeight).toBe(initialHeight);
      expect(panelStyle()?.flex).toBe(1);
      expect(
        StyleSheet.flatten(view.root.findByType(ScrollView).props.style)?.flex,
      ).toBe(1);
    }
  } finally {
    await ReactTestRenderer.act(async () => view.unmount());
  }
});

test('cere confirmare înainte să închidă un formular modificat', async () => {
  const onClose = jest.fn();
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <SafeAreaInsetsContext.Provider value={insets}>
        <FormModalFrame
          hasUnsavedChanges
          onClose={onClose}
          title="Client nou"
          visible
        >
          <Text>Formular</Text>
        </FormModalFrame>
      </SafeAreaInsetsContext.Provider>,
    );
  });

  await ReactTestRenderer.act(async () => {
    renderer?.root.findByType(IconButton).props.onPress();
  });

  expect(onClose).not.toHaveBeenCalled();
  const dialog = renderer?.root.findByType(AppDialog);
  expect(dialog?.props.dialog).toMatchObject({
    title: 'Modificări nesalvate',
    confirmLabel: 'Pleacă fără să salvezi',
    destructive: true,
  });

  await ReactTestRenderer.act(async () => {
    dialog?.props.onConfirm();
  });

  expect(onClose).toHaveBeenCalledTimes(1);

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });
});

test('mută acțiunile în scroll când tastatura lasă prea puțin spațiu pentru header și footer', async () => {
  (useKeyboardOverlap as jest.Mock).mockReturnValue(windowHeight - 180);
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <SafeAreaInsetsContext.Provider value={insets}>
        <FormModalFrame
          visible
          title="Formular"
          onClose={() => undefined}
          footer={<Text testID="footer-action">Salvează</Text>}
        >
          <Text>Conținut</Text>
        </FormModalFrame>
      </SafeAreaInsetsContext.Provider>,
    );
  });
  const measuredChrome =
    renderer?.root.findAll(
      node =>
        typeof node.props.onLayout === 'function' &&
        (StyleSheet.flatten(node.props.style)?.flexDirection === 'row' ||
          StyleSheet.flatten(node.props.style)?.borderTopWidth === 1),
    ) ?? [];
  await ReactTestRenderer.act(async () => {
    measuredChrome.forEach(node =>
      node.props.onLayout({ nativeEvent: { layout: { height: 120 } } }),
    );
  });
  expect(
    renderer?.root
      .findByType(ScrollView)
      .findByProps({ testID: 'footer-action' }),
  ).toBeDefined();
  await ReactTestRenderer.act(async () => renderer?.unmount());
});
