import React from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { DirectoryItem } from '@/features/company/types';
import { staffRoleOptions } from '@/features/bookings/utils/bookingLabels';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { ControlledSelectField } from '@/shared/components/ControlledSelectField';
import { AppButton } from '@/shared/components/AppButton';

export function BookingStaffFields({
  form,
  employees,
}: {
  form: UseFormReturn<BookingFormValues>;
  employees: DirectoryItem[];
}) {
  const staff = useFieldArray({ control: form.control, name: 'staff' });
  return (
    <>
      {staff.fields.map((field, index) => (
        <React.Fragment key={field.id}>
          <ControlledSelectField
            control={form.control}
            name={`staff.${index}.employee_id` as const}
            label="Persoană"
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
          />
          <ControlledSelectField
            control={form.control}
            name={`staff.${index}.job_role` as const}
            label="Rol la eveniment"
            single
            options={staffRoleOptions}
            placeholder="Alege rolul"
            searchPlaceholder="Caută rol"
          />
          <ControlledSelectField
            control={form.control}
            name={`staff.${index}.pay_type` as const}
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
            label="Sumă / tarif (lei)"
            placeholder="0,00"
            keyboardType="decimal-pad"
          />
          <ControlledTextField
            control={form.control}
            name={`staff.${index}.starts_at` as const}
            label="Început lucru — data și ora"
            placeholder="2026-10-24 16:00"
          />
          <ControlledTextField
            control={form.control}
            name={`staff.${index}.ends_at` as const}
            label="Sfârșit lucru — data și ora"
            placeholder="2026-10-25 05:00"
          />
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
            rate: '0',
            starts_at: form.getValues('starts_at'),
            ends_at: form.getValues('ends_at'),
          })
        }
      />
    </>
  );
}
