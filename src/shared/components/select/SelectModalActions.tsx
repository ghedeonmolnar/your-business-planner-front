import React from 'react';
import { AppButton } from '@/shared/components/AppButton';
import { FormActions } from '@/shared/components/FormActions';

type SelectModalActionsProps = {
  single: boolean;
  canClear: boolean;
  disabled?: boolean;
  onClear: () => void;
  onConfirm: () => void;
};

export function SelectModalActions({
  single,
  canClear,
  disabled,
  onClear,
  onConfirm,
}: SelectModalActionsProps) {
  const clear = { label: 'Golește selecția', onPress: onClear, disabled };
  return single ? (
    <AppButton {...clear} variant="ghost" />
  ) : (
    <FormActions
      primary={{ label: 'Confirmă', onPress: onConfirm, disabled }}
      secondary={canClear ? clear : undefined}
    />
  );
}
