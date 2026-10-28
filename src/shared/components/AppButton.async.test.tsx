import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {
  Button,
  IconButton as PaperIconButton,
  TouchableRipple,
} from 'react-native-paper';
import { AppButton } from '@/shared/components/AppButton';
import { AppThemeProvider } from '@/shared/theme/AppThemeProvider';
import { showError } from '@/shared/feedback/showError';
import { advanceSessionGeneration } from '@/shared/api/sessionExpiry';

jest.mock('@/shared/feedback/showError', () => ({ showError: jest.fn() }));

test.each(['normal', 'icon', 'multiline'] as const)(
  'butonul %s urmărește operațiunea asincronă și blochează apăsările repetate',
  async kind => {
    let finish: (() => void) | undefined;
    const operation = new Promise<void>(resolve => {
      finish = resolve;
    });
    const onPress = jest.fn(() => operation);
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <AppThemeProvider>
          <AppButton
            label="Salvează"
            icon="arrow-forward"
            iconPosition="right"
            multiline={kind === 'multiline'}
            size={kind === 'icon' ? 'icon' : 'medium'}
            onPress={onPress}
          />
        </AppThemeProvider>,
      );
    });
    const button = () =>
      kind === 'icon'
        ? renderer.root.findByType(PaperIconButton)
        : kind === 'multiline'
          ? renderer.root.findByType(TouchableRipple)
          : renderer.root.findByType(Button);
    try {
      await ReactTestRenderer.act(async () => {
        void button().props.onPress();
        void button().props.onPress();
      });
      expect(onPress).toHaveBeenCalledTimes(1);
      expect(button().props.disabled).toBe(true);
      expect(button().props.accessibilityState.busy).toBe(true);
      await ReactTestRenderer.act(async () => {
        finish?.();
        await operation;
      });
      expect(button().props.disabled).toBe(false);
      expect(button().props.accessibilityState.busy).toBe(false);
    } finally {
      finish?.();
      await ReactTestRenderer.act(async () => renderer!.unmount());
    }
  },
);

test('o eroare raportată reactivează butonul pentru reîncercare', async () => {
  jest.mocked(showError).mockClear();
  const failure = new Error('Request failed');
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <AppButton label="Trimite" onPress={() => Promise.reject(failure)} />,
    );
  });
  try {
    await ReactTestRenderer.act(async () => {
      await renderer!.root.findByType(Button).props.onPress();
    });
    expect(showError).toHaveBeenCalledWith(
      failure,
      'Nu am putut finaliza acțiunea.',
      { source: 'button-action' },
    );
    expect(renderer!.root.findByType(Button).props.disabled).toBe(false);
  } finally {
    await ReactTestRenderer.act(async () => renderer!.unmount());
  }
});

test('rezultatul unei acțiuni vechi nu oprește loaderul din sesiunea nouă', async () => {
  jest.mocked(showError).mockClear();
  let rejectOld: ((error: Error) => void) | undefined;
  let finishNew: (() => void) | undefined;
  const oldOperation = new Promise<void>((_resolve, reject) => {
    rejectOld = reject;
  });
  const newOperation = new Promise<void>(resolve => {
    finishNew = resolve;
  });
  const onPress = jest
    .fn()
    .mockReturnValueOnce(oldOperation)
    .mockReturnValueOnce(newOperation);
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <AppButton label="Trimite" onPress={onPress} />,
    );
  });
  const button = () => renderer.root.findByType(Button);
  try {
    await ReactTestRenderer.act(async () => {
      void button().props.onPress();
    });
    await ReactTestRenderer.act(async () => advanceSessionGeneration());
    expect(button().props.disabled).toBe(false);
    await ReactTestRenderer.act(async () => {
      void button().props.onPress();
    });
    await ReactTestRenderer.act(async () => {
      rejectOld?.(new Error('Old session'));
    });
    expect(button().props.accessibilityState.busy).toBe(true);
    expect(showError).not.toHaveBeenCalled();
    await ReactTestRenderer.act(async () => {
      finishNew?.();
      await newOperation;
    });
    expect(button().props.disabled).toBe(false);
  } finally {
    rejectOld?.(new Error('Old session'));
    finishNew?.();
    await ReactTestRenderer.act(async () => renderer!.unmount());
  }
});
