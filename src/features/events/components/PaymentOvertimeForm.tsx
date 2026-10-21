import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { usePaymentOvertimeForm } from '@/features/events/hooks/usePaymentOvertimeForm';
import {
  ControlledSelectField,
  SelectOption,
} from '@/shared/components/ControlledSelectField';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { formatExactMoney } from '@/shared/utils/money';
import { theme } from '@/shared/theme/theme';

type PaymentOvertimeFormProps = {
  form: ReturnType<typeof usePaymentOvertimeForm>;
  employees: SelectOption<string>[];
};

export function PaymentOvertimeForm({
  form,
  employees,
}: PaymentOvertimeFormProps) {
  const { control, values, employeeIds, extraAmount, total } = form;
  const hasOvertime = values.has_overtime === 'yes';

  return (
    <>
      <ControlledSelectField
        control={control}
        label="A fost prelungire?"
        name="has_overtime"
        options={[
          { id: 'no', name: 'Nu' },
          { id: 'yes', name: 'Da' },
        ]}
        placeholder="Alege răspunsul"
        searchPlaceholder="Caută"
        single
      />
      {hasOvertime ? (
        <>
          <ControlledTextField
            control={control}
            keyboardType="decimal-pad"
            label="Câte ore a durat prelungirea?"
            name="hours"
            numeric
            placeholder="Ex.: 1,5"
          />
          <ControlledTextField
            control={control}
            keyboardType="decimal-pad"
            label="Tarif client pe oră / animator (lei)"
            name="hourly_rate"
            numeric
            placeholder="Ex.: 150"
          />
          <ControlledSelectField
            control={control}
            label="Cine a participat la prelungire?"
            name="scope"
            options={[
              { id: 'all', name: 'Toți animatorii' },
              { id: 'selected', name: 'Doar anumiți animatori' },
            ]}
            placeholder="Alege animatorii"
            searchPlaceholder="Caută"
            single
          />
          {values.scope === 'selected' ? (
            <ControlledSelectField
              control={control}
              label="Animatori participanți"
              name="employee_ids"
              options={employees}
              placeholder="Alege unul sau mai mulți animatori"
              searchPlaceholder="Caută animatorul"
            />
          ) : (
            <Text style={styles.summary}>
              {employees.map(employee => employee.name).join(', ') ||
                'Nu sunt animatori asignați'}
            </Text>
          )}
          <Text style={styles.summary}>
            Prelungire: {formatExactMoney(extraAmount)} ({employeeIds.length}{' '}
            {employeeIds.length === 1 ? 'animator' : 'animatori'})
          </Text>
        </>
      ) : null}
      <Text style={styles.summary}>
        Total de încasat: {formatExactMoney(total)}
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  summary: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.body,
    marginBottom: theme.spacing.md,
  },
});
