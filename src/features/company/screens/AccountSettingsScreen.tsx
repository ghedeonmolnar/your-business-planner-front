import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '@/features/auth/AuthProvider';
import { useChangePasswordForm } from '@/features/auth/hooks/useChangePasswordForm';
import { ChangePasswordFields } from '@/features/auth/components/ChangePasswordFields';
import { OwnerProfileForm } from '@/features/company/components/OwnerProfileForm';
import { useOwnerProfileForm } from '@/features/company/hooks/useOwnerProfileForm';
import { RootStackParamList } from '@/shared/navigation/types';
import { AppSegmentedControl } from '@/shared/components/AppSegmentedControl';
import { FormScreenFrame } from '@/shared/components/FormScreenFrame';
import { FormPanel } from '@/shared/components/FormPanel';
import { FormActions } from '@/shared/components/FormActions';
import { Screen } from '@/shared/components/Screen';
import { LoadingState } from '@/shared/components/LoadingState';

export function AccountSettingsScreen({
  route,
}: NativeStackScreenProps<RootStackParamList, 'AccountSettings'>) {
  const { user } = useAuth();
  if (!user)
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  return (
    <AccountSettingsEditor
      key={`${user.id}:${user.company?.id}:${user.role}`}
      initialTab={route.params?.tab}
    />
  );
}

function AccountSettingsEditor({
  initialTab,
}: {
  initialTab?: 'profile' | 'security';
}) {
  const { user } = useAuth();
  const [tab, setTab] = useState(initialTab === 'security' ? 1 : 0);
  const profile = useOwnerProfileForm();
  const password = useChangePasswordForm();
  const { isDirty: profileDirty, isValid: profileValid } =
    profile.form.formState;
  const { isDirty: passwordDirty, isValid: passwordValid } =
    password.form.formState;
  const active = tab === 0 ? profile : password;
  const canSave =
    tab === 0 ? profileDirty && profileValid : passwordDirty && passwordValid;
  const busy = profile.busy || password.busy;
  return (
    <FormScreenFrame
      title="Contul meu"
      subtitle={
        tab === 0
          ? 'Date personale și identitatea contului'
          : 'Protejează accesul la aplicație'
      }
      busy={busy}
      hasUnsavedChanges={profileDirty || passwordDirty}
      tabs={
        <AppSegmentedControl
          segments={[{ label: 'Date profil' }, { label: 'Securitate' }]}
          selectedIndex={tab}
          disabled={busy}
          onChangeIndex={setTab}
        />
      }
      footer={
        tab === 1 || user?.role === 'owner' ? (
          <FormActions
            busy={busy}
            primary={{
              label: tab === 0 ? 'Salvează profilul' : 'Actualizează parola',
              onPress: active.submit,
              disabled: !canSave,
            }}
          />
        ) : undefined
      }
    >
      {tab === 0 ? (
        <OwnerProfileForm form={profile.form} />
      ) : (
        <FormPanel title="Schimbă parola">
          <ChangePasswordFields form={password.form} />
        </FormPanel>
      )}
    </FormScreenFrame>
  );
}
