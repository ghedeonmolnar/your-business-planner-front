import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useAuth } from '@/features/auth/AuthProvider';
import { AgendaSummary } from '@/features/company/components/AgendaSummary';
import { MoreInfoModal } from '@/features/company/components/MoreInfoModal';
import { useMoreActions } from '@/features/company/hooks/useMoreActions';
import { hasCompanyFeature } from '@/features/company/utils/companyFeatures';
import { AppButton } from '@/shared/components/AppButton';
import { IconButton } from '@/shared/components/IconButton';
import { theme } from '@/shared/theme/theme';

type AgendaHeaderProps = {
  onCreate: () => void;
  onOpenCalendar: () => void;
  creating?: boolean;
};

export function AgendaHeader({
  onCreate,
  onOpenCalendar,
  creating = false,
}: AgendaHeaderProps) {
  const { user } = useAuth();
  const actions = useMoreActions();
  const canManage = user?.role !== 'employee';
  return (
    <>
      <View style={styles.header}>
        <View style={styles.greetingRow}>
          <View style={styles.greeting}>
            <Text style={styles.company}>{user?.company?.name}</Text>
            <Text accessibilityRole="header" style={styles.title}>
              Bună, {user?.name.split(' ')[0]}!
            </Text>
          </View>
          <IconButton
            accessibilityLabel="Notificări"
            icon="notifications-outline"
            style={styles.notifications}
            onPress={() => actions.setPanel('notifications')}
          />
        </View>
        <Text style={styles.description}>
          Evenimentele care urmează și încasările tale, într-un singur loc.
        </Text>
        {canManage ? (
          <AppButton
            icon="add"
            label="Rezervare nouă"
            loading={creating}
            size="large"
            onPress={onCreate}
          />
        ) : null}
        {canManage && hasCompanyFeature(user, 'finance') ? (
          <AgendaSummary />
        ) : null}
        <View style={styles.sectionRow}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Următoarele evenimente
          </Text>
          {canManage ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Vezi calendarul"
              onPress={onOpenCalendar}
              style={styles.calendarLink}
            >
              <Ionicons
                accessible={false}
                name="calendar-outline"
                color={theme.colors.menu.primary}
                size={theme.typography.sectionTitle}
              />
              <Text style={styles.calendarLabel}>Vezi calendarul</Text>
              <Ionicons
                accessible={false}
                name="chevron-forward"
                color={theme.colors.menu.primary}
                size={theme.typography.bodyLarge}
              />
            </Pressable>
          ) : null}
        </View>
      </View>
      {actions.panel && user ? (
        <MoreInfoModal
          panel={actions.panel}
          user={user}
          email={actions.email}
          phone={actions.phone}
          onClose={() => actions.setPanel(null)}
          onEmail={actions.writeEmail}
          onPhone={actions.callSupport}
          onSettings={actions.openSettings}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  header: { gap: theme.spacing.sm },
  greetingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  greeting: { flex: 1, gap: theme.spacing.xs },
  company: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.bodySmall,
  },
  title: {
    color: theme.colors.menu.text,
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.display,
  },
  notifications: { borderRadius: theme.radius.pill },
  description: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.bodySmall,
  },
  sectionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.menu.text,
    flexGrow: 1,
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.subtitle,
  },
  calendarLink: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    minHeight: theme.controls.fieldHeight,
  },
  calendarLabel: {
    color: theme.colors.menu.primary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.typography.bodySmall,
  },
});
