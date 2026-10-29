import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {
  Button,
  IconButton as PaperIconButton,
  TouchableRipple,
} from 'react-native-paper';
import { AppButton, AppButtonVariant } from '@/shared/components/AppButton';
import { MultilineButton } from '@/shared/components/MultilineButton';
import { AppThemeProvider } from '@/shared/theme/AppThemeProvider';
import { theme } from '@/shared/theme/theme';

test.each(['normal', 'icon', 'multiline'] as const)(
  'butonul %s blochează apăsarea în timpul încărcării și se reactivează',
  async kind => {
    const onPress = jest.fn();
    const render = (loading: boolean) => (
      <AppThemeProvider>
        <AppButton
          icon="add"
          label="Salvează"
          loading={loading}
          loadingLabel="Se salvează…"
          multiline={kind === 'multiline'}
          size={kind === 'icon' ? 'icon' : 'medium'}
          onPress={onPress}
        />
      </AppThemeProvider>
    );
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(render(true));
    });
    const button = () =>
      kind === 'icon'
        ? renderer.root.findByType(PaperIconButton)
        : kind === 'multiline'
          ? renderer.root.findByType(TouchableRipple)
          : renderer.root.findByType(Button);
    expect(button().props.disabled).toBe(true);
    await ReactTestRenderer.act(async () => {
      button().props.onPress();
    });
    expect(onPress).not.toHaveBeenCalled();
    await ReactTestRenderer.act(async () => {
      renderer.update(render(false));
    });
    await ReactTestRenderer.act(async () => {
      button().props.onPress();
    });
    expect(onPress).toHaveBeenCalledTimes(1);
    await ReactTestRenderer.act(async () => renderer.unmount());
  },
);

test.each([
  'primary',
  'outline',
  'soft',
  'ghost',
  'danger',
] as AppButtonVariant[])(
  'varianta %s este respectată de butoanele text, icon și multiline',
  async variant => {
    const render = (disabled: boolean) => (
      <AppThemeProvider>
        <>
          <AppButton
            label="Text"
            variant={variant}
            disabled={disabled}
            onPress={jest.fn()}
          />
          <AppButton
            label="Icon"
            icon="add"
            size="icon"
            variant={variant}
            disabled={disabled}
            onPress={jest.fn()}
          />
          <AppButton
            label="Multiline"
            multiline
            variant={variant}
            disabled={disabled}
            onPress={jest.fn()}
          />
        </>
      </AppThemeProvider>
    );
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(render(false));
    });
    const expectConsistentColors = () => {
      const text = renderer.root.findByType(Button);
      const icon = renderer.root.findByType(PaperIconButton);
      const multiline = renderer.root.findByType(MultilineButton);
      expect(icon.props.mode).toBe(
        variant === 'ghost' ? undefined : text.props.mode,
      );
      expect(icon.props.containerColor).toBe(text.props.buttonColor);
      expect(icon.props.iconColor).toBe(text.props.textColor);
      expect(multiline.props.backgroundColor).toBe(text.props.buttonColor);
      expect(multiline.props.color).toBe(text.props.textColor);
    };
    expectConsistentColors();
    if (variant === 'danger') {
      expect(renderer!.root.findByType(Button).props.buttonColor).toBe(
        theme.colors.error,
      );
      expect(renderer!.root.findByType(Button).props.textColor).toBe(
        theme.colors.onError,
      );
      expect(renderer!.root.findByType(Button).props.mode).toBe('contained');
    }
    await ReactTestRenderer.act(async () => renderer.update(render(true)));
    expectConsistentColors();
    await ReactTestRenderer.act(async () => renderer.unmount());
  },
);
