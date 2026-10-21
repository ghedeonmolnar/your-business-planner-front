import { hasCompanyFeature } from '@/features/company/utils/companyFeatures';
import { useAuth } from '@/features/auth/AuthProvider';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  accountInvitationSchema,
  AccountInvitationValues,
} from '@/features/company/schemas/accountInvitationSchema';
import {
  useDirectory,
  useInviteAccount,
} from '@/features/company/hooks/useCompany';
import { AppButton } from '@/shared/components/AppButton';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { ControlledSelectField } from '@/shared/components/ControlledSelectField';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { showError } from '@/shared/feedback/showError';
import { showMessage } from '@/shared/feedback/showMessage';

export function AccountInvitationForm({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const staffEnabled = hasCompanyFeature(user, 'staff');
  const invite = useInviteAccount();
  const employees = useDirectory('employees');
  const form = useForm<AccountInvitationValues>({
    resolver: zodResolver(accountInvitationSchema),
    defaultValues: { name: '', email: '', role: 'admin', employee_id: '' },
  });
  const role = form.watch('role');
  const submit = form.handleSubmit(values =>
    invite.mutate(
      {
        ...values,
        employee_id: role === 'employee' ? values.employee_id : null,
      },
      {
        onSuccess: () => {
          onClose();
          showMessage(
            'Invitație trimisă',
            'Persoana primește prin email codul pentru activarea contului.',
          );
        },
        onError: error => showError(error, 'Nu am putut trimite invitația.'),
      },
    ),
  );
  return (
    <FormModalFrame
      visible
      title="Invită în companie"
      onClose={onClose}
      hasUnsavedChanges={form.formState.isDirty}
      footer={
        <AppButton
          label="Trimite invitația"
          disabled={invite.isPending}
          onPress={submit}
        />
      }
    >
      <ControlledTextField
        control={form.control}
        name="name"
        label="Nume"
        placeholder="Numele persoanei"
      />
      <ControlledTextField
        control={form.control}
        name="email"
        label="Email"
        placeholder="email@exemplu.ro"
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <ControlledSelectField
        control={form.control}
        name="role"
        label="Drepturi în aplicație"
        single
        options={[
          { id: 'admin', name: 'Administrator companie' },
          ...(staffEnabled ? [{ id: 'employee', name: 'Angajat' }] : []),
        ]}
        placeholder="Alege drepturile"
        searchPlaceholder="Caută rol"
      />
      {role === 'employee' ? (
        <ControlledSelectField
          control={form.control}
          name="employee_id"
          label="Persoană din personal"
          single
          options={
            employees.data?.pages
              .flatMap(page => page.items)
              .filter(person => person.is_active)
              .map(person => ({ id: person.id, name: person.name })) ?? []
          }
          placeholder="Alege persoana"
          searchPlaceholder="Caută persoană"
        />
      ) : null}
      {role === 'employee' && employees.hasNextPage ? (
        <AppButton
          label="Mai multe persoane"
          disabled={employees.isFetchingNextPage}
          onPress={() => employees.fetchNextPage()}
        />
      ) : null}
    </FormModalFrame>
  );
}
