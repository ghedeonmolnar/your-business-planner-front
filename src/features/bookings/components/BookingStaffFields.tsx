import React from 'react';
import { Text } from 'react-native-paper';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { DirectoryItem } from '@/features/company/types';
import { staffRoleOptions } from '@/features/bookings/utils/bookingLabels';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import {
  ControlledSelectField,
  SelectOptionsState,
} from '@/shared/components/ControlledSelectField';
import { AppButton } from '@/shared/components/AppButton';
import { BookingStaffScheduleFields } from '@/features/bookings/components/BookingStaffScheduleFields';

export function BookingStaffFields({
  form,
  employees,
  optionsState,
}: {
  form: UseFormReturn<BookingFormValues>;
  employees: DirectoryItem[];
  optionsState?: SelectOptionsState;
}) {
  const staff = useFieldArray({ control: form.control, name: 'staff' });
  return (
    <>
      <Text>
        Completează programul și remunerația fiecărei persoane. Tariful zero
        trebuie ales explicit.
      </Text>
      {staff.fields.map((field, index) => (
        <React.Fragment key={field.id}>
          <ControlledSelectField
            control={form.control}
            name={`staff.${index}.employee_id` as const}
            required
            label="Persoană"
            icon="person-outline"
            optionsState={optionsState}
            single
            options={employees
              .filter(
                person =>
                  person.is_active ||
                  form
                    .getValues('staff')
                    .some(assignment => assignment.employee_id === person.id),
              )
              .map(person => ({
                id: person.id,
                name:
                  person.name +
                  (person.is_available === false
                    ? ' · Ocupată în programul evenimentului'
                    : ''),
              }))}
            placeholder="Alege persoana"
            searchPlaceholder="Caută persoană"
            onSelectionChange={selected => {
              if (form.getValues(`staff.${index}.employee_id`) === selected[0])
                return;
              const person = employees.find(item => item.id === selected[0]);
              if (!person) return;
              if (
                person.job_role &&
                staffRoleOptions.some(option => option.id === person.job_role)
              )
                form.setValue(`staff.${index}.job_role`, person.job_role, {
                  shouldDirty: true,
                });
              if (
                person.hourly_rate !== null &&
                person.hourly_rate !== undefined
              ) {
                form.setValue(`staff.${index}.pay_type`, 'hourly', {
                  shouldDirty: true,
                });
                form.setValue(
                  `staff.${index}.rate`,
                  String(person.hourly_rate),
                  { shouldDirty: true },
                );
              } else {
                form.setValue(`staff.${index}.rate`, '', { shouldDirty: true });
              }
            }}
          />
          <ControlledSelectField
            control={form.control}
            name={`staff.${index}.job_role` as const}
            required
            label="Rol la eveniment"
            single
            options={staffRoleOptions}
            placeholder="Alege rolul"
            searchPlaceholder="Caută rol"
          />
          <ControlledSelectField
            control={form.control}
            name={`staff.${index}.pay_type` as const}
            required
            label="Remunerație"
            single
            options={[
              { id: 'fixed', name: 'Sumă pe eveniment' },
              { id: 'hourly', name: 'Tarif orar' },
            ]}
            placeholder="Alege calculul"
            searchPlaceholder="Caută calcul"
          />
          <ControlledTextField
            control={form.control}
            name={`staff.${index}.rate` as const}
            required
            label="Sumă / tarif (lei)"
            placeholder="0,00"
            keyboardType="decimal-pad"
          />
          <BookingStaffScheduleFields form={form} index={index} />
          <AppButton
            label="Elimină persoana"
            variant="ghost"
            onPress={() => staff.remove(index)}
          />
        </React.Fragment>
      ))}
      <AppButton
        label="Adaugă persoană"
        variant="outline"
        onPress={() =>
          staff.append({
            employee_id: '',
            job_role: 'waiter',
            pay_type: 'fixed',
            rate: '',
            starts_at: form.getValues('starts_at'),
            ends_at: form.getValues('ends_at'),
          })
        }
      />
    </>
  );
}
