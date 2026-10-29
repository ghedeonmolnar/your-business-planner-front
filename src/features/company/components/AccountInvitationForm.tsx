import { hasCompanyFeature } from '@/features/company/utils/companyFeatures';
import { useAuth } from '@/features/auth/AuthProvider';
import React from 'react';
import { useAppForm } from '@/shared/hooks/useAppForm';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  accountInvitationSchema,
  AccountInvitationValues,
} from '@/features/company/schemas/accountInvitationSchema';
import {
  useDirectory,
  useInviteAccount,
} from '@/features/company/hooks/useCompany';
import { FormActions } from '@/shared/components/FormActions';
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
  const form = useAppForm<AccountInvitationValues>({
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
            'Invitație salvată',
            'Emailul de activare este programat pentru expediere. Starea lui apare în lista invitațiilor.',
          );
        },
        onError: error => showError(error, 'Nu am putut trimite invitația.'),
      },
    ),
  );
  return (
    <FormModalFrame
      visible
      busy={invite.isPending}
      title="Invită în companie"
      onClose={onClose}
      hasUnsavedChanges={form.formState.isDirty}
      footer={
        <FormActions
          busy={invite.isPending}
          primary={{ label: 'Trimite invitația', onPress: submit }}
        />
      }
    >
      <ControlledTextField
        control={form.control}
        name="name"
        required
        label="Nume"
        placeholder="Numele persoanei"
      />
      <ControlledTextField
        control={form.control}
        name="email"
        required
        label="Email"
        placeholder="email@exemplu.ro"
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <ControlledSelectField
        control={form.control}
        name="role"
        required
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
          required
          label="Persoană din personal"
          icon="person-outline"
          optionsState={{
            loading: employees.isLoading,
            error: employees.error,
            onRetry: () => employees.refetch(),
            pagination: {
              hasMore: Boolean(employees.hasNextPage),
              loading: employees.isFetchingNextPage,
              error: employees.isFetchNextPageError
                ? employees.error
                : undefined,
              onLoadMore: () => employees.fetchNextPage(),
            },
          }}
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
    </FormModalFrame>
  );
}
