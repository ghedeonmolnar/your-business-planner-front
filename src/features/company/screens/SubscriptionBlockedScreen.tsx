import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useAuth } from '@/features/auth/AuthProvider';
import { contentStyles as styles } from '@/shared/components/contentStyles';
import { AppButton } from '@/shared/components/AppButton';
import { Screen } from '@/shared/components/Screen';
import { ContentSection } from '@/shared/components/ContentSection';
import { showError } from '@/shared/feedback/showError';
import { ChangePasswordForm } from '@/features/auth/components/ChangePasswordForm';

export function SubscriptionBlockedScreen() {
  const { user, signOut, retryBootstrap } = useAuth();
  const [changingPassword, setChangingPassword] = useState(false);
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <ContentSection title="Accesul companiei este inactiv" size="page" />
        <Text style={styles.text}>
          Datele sunt păstrate. Contactează administratorul platformei pentru
          activarea sau prelungirea abonamentului.
        </Text>
        <Text style={styles.text}>{user?.support_email ?? ''}</Text>
        <Text style={styles.text}>{user?.support_phone ?? ''}</Text>
        <AppButton label="Verifică reactivarea" onPress={retryBootstrap} />
        <AppButton
          label="Schimbă parola"
          variant="outline"
          onPress={() => setChangingPassword(true)}
        />
        <AppButton
          label="Deconectare"
          variant="outline"
          onPress={() => {
            signOut().catch(error =>
              showError(error, 'Nu am putut închide sesiunea.'),
            );
          }}
        />
      </ScrollView>
      {changingPassword ? (
        <ChangePasswordForm onClose={() => setChangingPassword(false)} />
      ) : null}
    </Screen>
  );
}
