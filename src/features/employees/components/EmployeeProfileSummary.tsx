import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { EmployeeProfile } from '@/features/employees/types';
import { Card } from '@/shared/components/Card';
import { theme } from '@/shared/theme/theme';
import { formatLongDate } from '@/shared/utils/formatDate';
import { formatExactMoney } from '@/shared/utils/money';

const genderLabels = {
  male: 'Masculin',
  female: 'Feminin',
};

export function EmployeeProfileSummary({
  profile,
}: {
  profile: EmployeeProfile;
}) {
  return (
    <>
      <View style={styles.titleRow}>
        <View style={styles.titleArea}>
          <Text style={styles.eyebrow}>ECHIPĂ</Text>
          <Text style={styles.title}>{profile.name}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            profile.is_active ? styles.activeBadge : styles.inactiveBadge,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              profile.is_active ? styles.activeText : styles.inactiveText,
            ]}
          >
            {profile.is_active ? 'Activ' : 'Inactiv'}
          </Text>
        </View>
      </View>

      <Card style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Detalii angajat</Text>
        <View style={styles.detailsGrid}>
          <Detail
            label="Data nașterii"
            value={formatLongDate(profile.birth_date)}
          />
          <Detail
            label="Sex"
            value={
              profile.gender ? genderLabels[profile.gender] : 'Nespecificat'
            }
          />
          <Detail
            label="Tarif pe oră"
            value={
              profile.hourly_rate === null
                ? 'Nespecificat'
                : formatExactMoney(profile.hourly_rate)
            }
          />
          <Detail
            label="În echipă din"
            value={formatLongDate(profile.created_at)}
          />
        </View>
      </Card>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  titleArea: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  eyebrow: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.caption,
    letterSpacing: 1,
    marginBottom: theme.spacing.xs,
  },
  title: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.display,
    lineHeight: 36,
  },
  statusBadge: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  activeBadge: {
    backgroundColor: theme.colors.surface,
  },
  inactiveBadge: {
    backgroundColor: theme.colors.redSoft,
  },
  statusText: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.label,
  },
  activeText: {
    color: theme.colors.success,
  },
  inactiveText: {
    color: theme.colors.danger,
  },
  detailsCard: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.bodyLarge,
    marginBottom: theme.spacing.md,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    marginBottom: theme.spacing.md,
    minWidth: '50%',
    paddingRight: theme.spacing.md,
  },
  detailLabel: {
    color: theme.colors.subtle,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.typography.label,
  },
  detailValue: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.bodySmall,
    lineHeight: 20,
    marginTop: theme.spacing.xs,
  },
});
