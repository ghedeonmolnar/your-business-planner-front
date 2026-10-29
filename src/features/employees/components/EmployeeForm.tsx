import React, { useEffect } from 'react';
import { useAppForm } from '@/shared/hooks/useAppForm';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  EmployeeFormInput,
  EmployeeFormValues,
  employeeSchema,
  emptyEmployeeForm,
} from '@/features/employees/schemas/employeeSchema';
import { Employee } from '@/features/employees/types';
import { ControlledSelectField } from '@/shared/components/ControlledSelectField';
import { ControlledBirthDateField } from '@/shared/components/ControlledBirthDateField';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { ControlledSwitchField } from '@/shared/components/ControlledSwitchField';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { AppButton } from '@/shared/components/AppButton';
import { splitBirthDate } from '@/shared/utils/birthDate';
import { VersionConflictNotice } from '@/shared/components/VersionConflictNotice';

type EmployeeFormProps = {
  visible: boolean;
  initialEmployee?: Employee | null;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (values: EmployeeFormValues) => void;
  conflict?: boolean;
  onReload?: () => Promise<void>;
};

const genderOptions = [
  { id: 'male', name: 'Masculin' },
  { id: 'female', name: 'Feminin' },
];

const toFormValues = (employee?: Employee | null): EmployeeFormInput => {
  if (!employee) {
    return emptyEmployeeForm;
  }

  const birthDate = splitBirthDate(employee.birth_date);

  return {
    name: employee.name,
    gender: employee.gender ?? '',
    hourly_rate: employee.hourly_rate,
    birth_year: birthDate.year,
    birth_month: birthDate.month,
    birth_day: birthDate.day,
    is_active: employee.is_active ?? true,
  };
};

export function EmployeeForm({
  visible,
  initialEmployee,
  saving,
  onCancel,
  onSubmit,
  conflict = false,
  onReload,
}: EmployeeFormProps) {
  const {
    control,
    formState: { isDirty },
    handleSubmit,
    reset,
  } = useAppForm<EmployeeFormInput, unknown, EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: emptyEmployeeForm,
  });
  useEffect(() => {
    if (visible) {
      reset(toFormValues(initialEmployee));
    }
  }, [initialEmployee, reset, visible]);

  return (
    <FormModalFrame
      footer={
        <AppButton
          disabled={saving || conflict}
          loading={saving}
          fullWidth
          label={saving ? 'Se salvează...' : 'Salvează'}
          onPress={handleSubmit(onSubmit)}
          size="large"
        />
      }
      hasUnsavedChanges={isDirty}
      onClose={onCancel}
      title={initialEmployee ? 'Editează angajat' : 'Angajat nou'}
      visible={visible}
      busy={saving}
    >
      {conflict && onReload ? (
        <VersionConflictNotice onReload={onReload} />
      ) : null}
      <ControlledTextField
        control={control}
        required
        label="Nume"
        name="name"
        placeholder="Numele angajatului"
      />
      <ControlledSelectField
        control={control}
        required
        label="Sex"
        name="gender"
        noItemsText="Nu există opțiuni"
        options={genderOptions}
        placeholder="Alege sexul"
        searchPlaceholder="Caută..."
        single
        singleEmptyValue=""
      />
      <ControlledTextField
        control={control}
        keyboardType="numeric"
        label="Tarif pe oră"
        name="hourly_rate"
        numeric
        placeholder="Ex: 120 sau lasă liber"
      />
      <ControlledBirthDateField
        control={control}
        dayName="birth_day"
        required
        label="Data nașterii"
        monthName="birth_month"
        yearName="birth_year"
      />
      <ControlledSwitchField
        activeText="Activ"
        control={control}
        inactiveText="Inactiv"
        required
        label="Status"
        name="is_active"
      />
    </FormModalFrame>
  );
}
