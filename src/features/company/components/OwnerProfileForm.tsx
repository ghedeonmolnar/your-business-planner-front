import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Text, TextInput } from 'react-native-paper';
import { useAuth } from '@/features/auth/AuthProvider';
import { OwnerProfileValues } from '@/features/company/schemas/ownerProfileSchema';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { FormPanel } from '@/shared/components/FormPanel';
import { contentStyles as styles } from '@/shared/components/contentStyles';

export function OwnerProfileForm({
  form,
}: {
  form: UseFormReturn<OwnerProfileValues>;
}) {
  const { user } = useAuth();
  return (
    <FormPanel title="Date personale">
      <ControlledTextField
        control={form.control}
        name="name"
        required
        disabled={user?.role !== 'owner'}
        label="Numele tău"
        placeholder="Nume și prenume"
        autoComplete="name"
      />
      <TextInput
        label="Email autentificare"
        accessibilityLabel="Email autentificare"
        accessibilityHint="Emailul nu poate fi modificat din acest formular."
        value={user?.email ?? ''}
        editable={false}
        mode="outlined"
      />
      <Text style={styles.muted}>
        Emailul de autentificare nu poate fi modificat aici.
      </Text>
    </FormPanel>
  );
}
