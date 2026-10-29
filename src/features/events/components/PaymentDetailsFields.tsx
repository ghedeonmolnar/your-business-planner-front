import React from 'react';
import { StyleSheet } from 'react-native';
import { Control } from 'react-hook-form';
import {
  PaymentFormInput,
  PaymentFormValues,
} from '@/features/events/schemas/paymentSchema';
import {
  methodOptions,
  statusOptions,
  typeOptions,
} from '@/features/events/components/paymentFormConfig';
import { AppSegmentedControl } from '@/shared/components/AppSegmentedControl';
import { ControlledDateField } from '@/shared/components/ControlledDateField';
import { ControlledSelectField } from '@/shared/components/ControlledSelectField';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { StarRatingField } from '@/shared/components/StarRatingField';
import { theme } from '@/shared/theme/theme';

type PaymentDetailsFieldsProps = {
  control: Control<PaymentFormInput, unknown, PaymentFormValues>;
  selectedType: PaymentFormInput['type'];
  settlementType: 'partial' | 'full';
  onSettlementTypeChange: (value: 'partial' | 'full') => void;
  rating: number | null;
  onRatingChange: (value: number | null) => void;
};

export function PaymentDetailsFields({
  control,
  selectedType,
  settlementType,
  onSettlementTypeChange,
  rating,
  onRatingChange,
}: PaymentDetailsFieldsProps) {
  const isFullSettlement =
    selectedType === 'incoming' && settlementType === 'full';

  return (
    <>
      <ControlledSelectField
        control={control}
        required
        label="Tip"
        name="type"
        options={[...typeOptions]}
        placeholder="Alege tipul"
        searchPlaceholder="Caută"
        single
        singleEmptyValue="incoming"
      />
      {selectedType === 'incoming' ? (
        <AppSegmentedControl
          containerStyle={styles.typeRow}
          onChangeIndex={index =>
            onSettlementTypeChange(index === 0 ? 'full' : 'partial')
          }
          selectedIndex={settlementType === 'full' ? 0 : 1}
          segments={[{ label: 'Integrală' }, { label: 'Parțială' }]}
        />
      ) : (
        <ControlledTextField
          autoCapitalize="none"
          control={control}
          required
          label="Categorie"
          name="category"
          placeholder="Ex: personal, furnizor"
        />
      )}
      {isFullSettlement ? (
        <StarRatingField
          label="Notă eveniment"
          onChange={onRatingChange}
          value={rating}
        />
      ) : null}
      <ControlledTextField
        control={control}
        keyboardType="numeric"
        required
        label={isFullSettlement ? 'Sumă fără prelungire' : 'Sumă'}
        name="amount"
        numeric
        placeholder="Ex: 150"
      />
      <ControlledDateField
        control={control}
        required
        label="Data"
        name="paid_at"
        placeholder="Alege data"
      />
      <ControlledSelectField
        control={control}
        label="Metodă"
        name="method"
        options={methodOptions}
        placeholder="Alege metoda"
        searchPlaceholder="Caută"
        single
        singleEmptyValue=""
      />
      <ControlledSelectField
        control={control}
        required
        label="Status"
        name="status"
        options={[...statusOptions]}
        placeholder="Alege statusul"
        searchPlaceholder="Caută"
        single
        singleEmptyValue="completed"
      />
      <ControlledTextField
        control={control}
        label="Note"
        multiline
        name="notes"
        placeholder="Observații"
      />
    </>
  );
}

const styles = StyleSheet.create({
  typeRow: {
    marginBottom: theme.spacing.md,
  },
});
