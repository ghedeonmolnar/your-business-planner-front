import React from 'react';
import { DirectoryItem, DirectoryKind } from '@/features/company/types';
import { useDirectoryForm } from '@/features/company/hooks/useDirectoryForm';
import { ClientConflictReview } from '@/features/company/components/ClientConflictReview';
import { Text } from 'react-native-paper';
import { staffRoleOptions } from '@/features/bookings/utils/bookingLabels';
import { FormActions } from '@/shared/components/FormActions';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { ControlledSelectField } from '@/shared/components/ControlledSelectField';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { EmployeeConflictReview } from '@/features/company/components/EmployeeConflictReview';

export function DirectoryForm({
  kind,
  item,
  onClose,
}: {
  kind: DirectoryKind;
  item?: DirectoryItem;
  onClose: () => void;
}) {
  const { form, submit, busy, conflict, reload, readOnly } = useDirectoryForm(
    kind,
    item,
    onClose,
  );
  return (
    <FormModalFrame
      visible
      readOnly={readOnly}
      busy={busy}
      title={
        kind === 'clients'
          ? item
            ? 'Editează clientul'
            : 'Client nou'
          : kind === 'halls'
            ? item
              ? 'Editează sala'
              : 'Sală nouă'
            : item
              ? 'Editează persoana'
              : 'Persoană nouă'
      }
      onClose={onClose}
      hasUnsavedChanges={form.formState.isDirty}
      footer={
        <FormActions
          busy={busy}
          primary={{ label: 'Salvează', onPress: submit, disabled: conflict }}
        />
      }
    >
      {conflict && kind === 'clients' && item ? (
        <ClientConflictReview clientId={item.id} onReload={reload} />
      ) : null}
      {conflict && kind === 'employees' && item ? (
        <EmployeeConflictReview employeeId={item.id} onReload={reload} />
      ) : null}
      {conflict && !item ? (
        <Text>
          Verifică lista clienților înainte de o nouă creare. Ciorna este
          păstrată.
        </Text>
      ) : null}
      {readOnly ? (
        <Text>
          Rezultatul salvării este incert. Reîncearcă aceeași operațiune înainte
          de a modifica datele.
        </Text>
      ) : null}
      <ControlledTextField
        control={form.control}
        name="name"
        label="Nume"
        placeholder="Nume"
      />
      {kind === 'clients' ? (
        <>
          <ControlledTextField
            control={form.control}
            name="phone"
            label="Telefon"
            placeholder="07…"
            keyboardType="phone-pad"
          />
          <ControlledTextField
            control={form.control}
            name="notes"
            label="Discuții și observații"
            placeholder="Detalii discutate"
            multiline
          />
        </>
      ) : null}
      {kind === 'halls' ? (
        <>
          <ControlledTextField
            control={form.control}
            name="capacity"
            label="Capacitate persoane"
            placeholder="200"
            keyboardType="number-pad"
          />
          <ControlledTextField
            control={form.control}
            name="address"
            label="Adresă"
            placeholder="Adresa sălii"
          />
        </>
      ) : null}
      {kind === 'employees' ? (
        <>
          <ControlledSelectField
            control={form.control}
            name="job_role"
            label="Rol operațional"
            single
            options={staffRoleOptions}
            placeholder="Alege rolul"
            searchPlaceholder="Caută rol"
          />
          <ControlledTextField
            control={form.control}
            name="hourly_rate"
            label="Tarif orar implicit (lei)"
            placeholder="0,00"
            keyboardType="decimal-pad"
          />
        </>
      ) : null}
      {kind !== 'clients' ? (
        <ControlledSelectField
          control={form.control}
          name="active"
          label="Stare"
          single
          options={[
            { id: 'yes', name: 'Activă' },
            { id: 'no', name: 'Arhivată / inactivă' },
          ]}
          placeholder="Alege starea"
          searchPlaceholder="Caută stare"
        />
      ) : null}
    </FormModalFrame>
  );
}
