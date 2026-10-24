import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppButton, AppButtonProps } from '@/shared/components/AppButton';
import { useSingleColumnLayout } from '@/shared/hooks/useSingleColumnLayout';
import { theme } from '@/shared/theme/theme';

type FormAction = Pick<
  AppButtonProps,
  | 'label'
  | 'onPress'
  | 'icon'
  | 'disabled'
  | 'loadingLabel'
  | 'variant'
  | 'accessibilityLabel'
>;

type FormActionsProps = {
  primary: FormAction;
  secondary?: FormAction;
  busy?: boolean;
};

export function FormActions({
  primary,
  secondary,
  busy = false,
}: FormActionsProps) {
  const singleColumn = useSingleColumnLayout();
  return (
    <View style={[styles.row, singleColumn ? styles.column : undefined]}>
      {secondary ? (
        <AppButton
          {...secondary}
          variant={secondary.variant ?? 'soft'}
          disabled={busy || secondary.disabled}
          multiline
          style={styles.action}
        />
      ) : null}
      <AppButton
        {...primary}
        loading={busy}
        disabled={busy || primary.disabled}
        multiline
        style={styles.action}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: theme.spacing.sm },
  column: { flexDirection: 'column' },
  action: { flexGrow: 1, flexShrink: 1 },
});
