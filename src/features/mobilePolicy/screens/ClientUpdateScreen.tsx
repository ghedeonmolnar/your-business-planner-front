import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Screen } from '@/shared/components/Screen';
import { AppButton } from '@/shared/components/AppButton';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { useAuth } from '@/features/auth/AuthProvider';
import { showError } from '@/shared/feedback/showError';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { theme } from '@/shared/theme/theme';

export function ClientUpdateScreen({
  storeUrl,
  onRetry,
}: {
  storeUrl?: string | null;
  onRetry: () => void;
}) {
  const { signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const openStore = async () => {
    if (!storeUrl || busy) return;
    setBusy(true);
    try {
      await Linking.openURL(storeUrl);
    } catch (error) {
      showError(error, 'Nu am putut deschide pagina de actualizare.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          Actualizează aplicația
        </Text>
        <Text style={styles.text}>
          Această versiune nu mai poate salva date în siguranță. Operațiunile
          neconfirmate rămân păstrate pe acest dispozitiv până la actualizare.
        </Text>
        {storeUrl ? (
          <AppButton
            label="Deschide actualizarea"
            onPress={openStore}
            loading={busy}
          />
        ) : (
          <ErrorBanner
            message="Pagina de actualizare nu este disponibilă. Reîncearcă verificarea versiunii."
            onRetry={onRetry}
          />
        )}
        <AppButton
          label="Verifică din nou"
          variant="outline"
          onPress={onRetry}
        />
        <AppButton
          label="Deconectare"
          variant="ghost"
          onPress={() =>
            confirmAction({
              destructive: true,
              title: 'Deconectare',
              message:
                'Deconectarea șterge de pe dispozitiv ciornele și operațiunile neconfirmate. Continuă numai după verificarea lor.',
              confirmLabel: 'Deconectează-mă',
              onConfirm: () => {
                return signOut().catch(error =>
                  showError(error, 'Nu am putut încheia deconectarea.'),
                );
              },
            })
          }
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: theme.spacing.lg, gap: theme.spacing.lg },
  title: {
    color: theme.colors.menu.text,
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.title,
  },
  text: {
    color: theme.colors.menu.text,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.body,
  },
});
