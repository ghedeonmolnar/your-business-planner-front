import { getSessionGeneration } from '@/shared/api/sessionExpiry';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppForm } from '@/shared/hooks/useAppForm';
import { EmployeeProfile } from '@/features/employees/types';
import {
  useBlockEmployee,
  useInviteEmployee,
  useUnblockEmployee,
} from '@/features/employees/hooks/useEmployees';
import {
  InvitationFormValues,
  invitationSchema,
} from '@/features/employees/schemas/invitationSchema';
import { AppButton } from '@/shared/components/AppButton';
import { Card } from '@/shared/components/Card';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { showError } from '@/shared/feedback/showError';
import { showMessage } from '@/shared/feedback/showMessage';
import { formatDateTime } from '@/shared/utils/formatDate';
import { theme } from '@/shared/theme/theme';

const statusLabels: Record<EmployeeProfile['account']['status'], string> = {
  not_invited: 'Fără invitație',
  pending: 'Invitație în așteptare',
  expired: 'Invitație expirată',
  active: 'Cont activ',
  blocked: 'Cont blocat',
};

export function EmployeeAccountCard({ profile }: { profile: EmployeeProfile }) {
  const [formVisible, setFormVisible] = useState(false);
  const invite = useInviteEmployee(profile.id);
  const block = useBlockEmployee(profile.id);
  const unblock = useUnblockEmployee(profile.id);
  const form = useAppForm<InvitationFormValues>({
    resolver: zodResolver(invitationSchema),
    defaultValues: { email: profile.account.email ?? '' },
  });
  const hasAccount =
    profile.account.status === 'active' || profile.account.status === 'blocked';

  const openInvite = () => {
    form.reset({ email: profile.account.email ?? '' });
    setFormVisible(true);
  };

  const submitInvite = form.handleSubmit(values => {
    invite.mutate(values.email.trim(), {
      onSuccess: invitation => {
        setFormVisible(false);
        showMessage(
          'Invitație trimisă',
          `Codul trimis la ${invitation.email} expiră la ${formatDateTime(invitation.expires_at)}.`,
        );
      },
      onError: error => showError(error, 'Nu am putut trimite invitația.'),
    });
  });

  const changeBlocked = () => {
    const isBlocked = profile.account.status === 'blocked';
    confirmAction({
      title: isBlocked ? 'Deblocare cont' : 'Blocare cont',
      message: isBlocked
        ? `Deblochezi contul ${profile.account.email}?`
        : `Blochezi contul ${profile.account.email}? Sesiunile active vor fi închise.`,
      confirmLabel: isBlocked ? 'Deblochează' : 'Blochează',
      onConfirm: () => {
        const actionGeneration = getSessionGeneration();

        const action = isBlocked ? unblock : block;
        return action.mutateAsync(undefined).catch(error => {
          if (actionGeneration !== getSessionGeneration()) return;
          return showError(error, 'Nu am putut schimba accesul.');
        });
      },
    });
  };

  return (
    <>
      <Card style={styles.card}>
        <Text style={styles.title}>Acces în aplicație</Text>
        <Text style={styles.status}>
          {statusLabels[profile.account.status]}
        </Text>
        {profile.account.email ? (
          <Text style={styles.email}>{profile.account.email}</Text>
        ) : null}
        {profile.account.status === 'pending' && profile.account.expires_at ? (
          <Text style={styles.expiry}>
            Expiră la {formatDateTime(profile.account.expires_at)}
          </Text>
        ) : null}
        {!profile.is_active ? (
          <Text style={styles.hint}>
            Activează angajatul pentru a-i oferi acces.
          </Text>
        ) : null}
        <View style={styles.action}>
          {hasAccount ? (
            <AppButton
              loading={block.isPending || unblock.isPending}
              disabled={
                !profile.is_active || block.isPending || unblock.isPending
              }
              label={
                profile.account.status === 'blocked'
                  ? 'Deblochează utilizator'
                  : 'Blochează utilizator'
              }
              onPress={changeBlocked}
              variant={
                profile.account.status === 'blocked' ? 'outline' : 'danger'
              }
            />
          ) : (
            <AppButton
              disabled={!profile.is_active || invite.isPending}
              loading={formVisible || invite.isPending}
              label={
                profile.account.status === 'not_invited'
                  ? 'Trimite invitație'
                  : 'Retrimite invitația'
              }
              onPress={openInvite}
            />
          )}
        </View>
      </Card>

      <FormModalFrame
        footer={
          <AppButton
            disabled={invite.isPending}
            loading={invite.isPending}
            fullWidth
            label={invite.isPending ? 'Se trimite...' : 'Trimite codul'}
            onPress={submitInvite}
          />
        }
        hasUnsavedChanges={form.formState.isDirty}
        onClose={() => setFormVisible(false)}
        title="Invită angajatul"
        visible={formVisible}
        busy={invite.isPending}
      >
        <ControlledTextField
          autoCapitalize="none"
          control={form.control}
          keyboardType="email-address"
          required
          label="Adresa de email"
          name="email"
          placeholder="nume@exemplu.ro"
        />
      </FormModalFrame>
    </>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: theme.spacing.lg },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.subtitle,
    fontFamily: theme.fonts.bodyBold,
  },
  status: {
    color: theme.colors.primary,
    fontSize: theme.typography.body,
    marginTop: theme.spacing.sm,
  },
  email: {
    color: theme.colors.text,
    fontSize: theme.typography.bodySmall,
    marginTop: theme.spacing.xs,
  },
  expiry: {
    color: theme.colors.muted,
    fontSize: theme.typography.bodySmall,
    marginTop: theme.spacing.xs,
  },
  hint: {
    color: theme.colors.muted,
    fontSize: theme.typography.bodySmall,
    marginTop: theme.spacing.sm,
  },
  action: { alignItems: 'flex-start', marginTop: theme.spacing.md },
});
