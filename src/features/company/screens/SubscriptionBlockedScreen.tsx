import React from 'react';
import { ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useAuth } from '@/features/auth/AuthProvider';
import { plannerStyles as styles } from '@/features/bookings/components/plannerStyles';
import { AppButton } from '@/shared/components/AppButton';
import { Screen } from '@/shared/components/Screen';
import { showError } from '@/shared/feedback/showError';

export function SubscriptionBlockedScreen() {
  const { user, signOut, retryBootstrap } = useAuth();
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Accesul companiei este inactiv</Text>
        <Text style={styles.text}>
          Datele sunt păstrate. Contactează administratorul platformei pentru
          activarea sau prelungirea abonamentului.
        </Text>
        <Text style={styles.text}>{user?.support_email ?? ''}</Text>
        <Text style={styles.text}>{user?.support_phone ?? ''}</Text>
        <AppButton label="Verifică reactivarea" onPress={retryBootstrap} />
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
    </Screen>
  );
}
