import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { AuthMode } from '@/features/auth/types';
import { LoginBrandLogo } from '@/features/auth/components/LoginBrandLogo';
import { AppButton } from '@/shared/components/AppButton';
import { IconBadge } from '@/shared/components/IconBadge';
import { theme } from '@/shared/theme/theme';

const headings: Record<AuthMode, { title: string; subtitle: string }> = {
  login: {
    title: 'Bine ai revenit!',
    subtitle: 'Evenimentele și echipa ta, într-un singur loc.',
  },
  register: {
    title: 'Alătură-te echipei',
    subtitle: 'Activează contul folosind invitația primită pe email.',
  },
  forgot: {
    title: 'Ai uitat parola?',
    subtitle: 'Te ajutăm să recapeți accesul la cont.',
  },
  reset: {
    title: 'Setează parola nouă',
    subtitle: 'Introdu codul primit pe email și alege o parolă nouă.',
  },
};

export function AuthHeader({
  mode,
  onBack,
}: {
  mode: AuthMode;
  onBack: () => void;
}) {
  const heading = headings[mode];

  return (
    <View style={styles.header}>
      {mode !== 'login' ? (
        <AppButton
          accessibilityLabel="Înapoi la autentificare"
          icon="arrow-back"
          label="Autentificare"
          onPress={onBack}
          variant="ghost"
          style={styles.back}
        />
      ) : null}
      <View style={styles.branding}>
        <LoginBrandLogo />
        {mode === 'forgot' ? (
          <IconBadge icon="key-outline" size="large" style={styles.badge} />
        ) : null}
        <View style={styles.heading}>
          <Text accessibilityRole="header" style={styles.title}>
            {heading.title}
          </Text>
          <Text
            style={[
              styles.subtitle,
              mode === 'register' ? styles.invitationSubtitle : undefined,
            ]}
          >
            {heading.subtitle}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center' },
  branding: { alignItems: 'center', gap: theme.spacing.xl, width: '100%' },
  back: { alignSelf: 'flex-start' },
  badge: { borderRadius: theme.radius.pill },
  heading: { gap: theme.spacing.sm, alignSelf: 'stretch' },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.display,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.bodyLarge,
    textAlign: 'center',
  },
  invitationSubtitle: { fontSize: theme.typography.body },
});
