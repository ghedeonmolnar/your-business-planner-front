import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { Card } from '@/shared/components/Card';
import { IconBadge } from '@/shared/components/IconBadge';
import { ActionTile } from '@/shared/components/ActionTile';
import { theme } from '@/shared/theme/theme';

type AccountOverviewCardProps = {
  name: string;
  email: string;
  companyName?: string;
  onOpenProfile?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function AccountOverviewCard({
  name,
  email,
  companyName,
  onOpenProfile,
  style,
}: AccountOverviewCardProps) {
  return (
    <Card style={[styles.card, style]}>
      <View style={styles.account}>
        <IconBadge icon="storefront-outline" size="large" />
        <View style={styles.details}>
          <Text style={styles.eyebrow}>CONTUL MEU</Text>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.detail}>{email}</Text>
          {companyName ? (
            <View style={styles.company}>
              <Ionicons
                accessible={false}
                name="storefront-outline"
                color={theme.colors.menu.muted}
                size={theme.typography.subtitle}
              />
              <Text style={[styles.detail, styles.companyName]}>
                {companyName}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
      {onOpenProfile ? (
        <ActionTile
          label="Profil și facturare"
          icon="document-text-outline"
          variant="soft"
          labelStyle={styles.profileLabel}
          onPress={onOpenProfile}
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.menu.surface,
    borderWidth: 0,
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  account: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  details: { flex: 1, gap: theme.spacing.xs, minWidth: 0 },
  eyebrow: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.typography.caption,
  },
  name: {
    color: theme.colors.menu.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.body,
  },
  detail: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.label,
  },
  company: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  companyName: { flex: 1 },
  profileLabel: { fontSize: theme.typography.bodySmall },
});
