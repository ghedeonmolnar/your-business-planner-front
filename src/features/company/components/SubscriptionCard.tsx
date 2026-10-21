import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { AuthUser } from '@/features/auth/types';
import { ActionTile } from '@/shared/components/ActionTile';
import { Card } from '@/shared/components/Card';
import { IconBadge } from '@/shared/components/IconBadge';
import { SectionDivider } from '@/shared/components/SectionDivider';
import { theme } from '@/shared/theme/theme';
import { formatCompanyDateTime } from '@/shared/utils/formatDate';

type SubscriptionCardProps = {
  plan?: AuthUser['plan'];
  subscription?: AuthUser['subscription'];
  onManage?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function SubscriptionCard({
  plan,
  subscription,
  onManage,
  style,
}: SubscriptionCardProps) {
  const active = Boolean(subscription?.active && !subscription.suspended);
  const status = subscription?.suspended
    ? 'Suspendat'
    : active
      ? 'Activ'
      : 'Inactiv';
  const statusColor = active
    ? theme.colors.menu.success
    : theme.colors.onErrorContainer;

  return (
    <Card style={[styles.card, style]}>
      <View style={styles.overview}>
        <IconBadge icon="ribbon" size="medium" />
        <View style={styles.details}>
          <View style={styles.heading}>
            <Text style={styles.title}>{plan?.name ?? 'Abonament'}</Text>
            <View
              style={[
                styles.status,
                {
                  backgroundColor: active
                    ? theme.colors.menu.successSoft
                    : theme.colors.menu.dangerSoft,
                },
              ]}
            >
              <Ionicons
                accessible={false}
                name={active ? 'checkmark-circle' : 'alert-circle'}
                color={statusColor}
                size={theme.typography.bodySmall}
              />
              <Text
                style={[
                  styles.statusLabel,
                  { color: active ? theme.colors.menu.text : statusColor },
                ]}
              >
                {status}
              </Text>
            </View>
          </View>
          {subscription?.trial ? (
            <Text style={styles.detail}>Perioadă de probă</Text>
          ) : null}
          {plan ? (
            <Text style={styles.detail}>
              {plan.users_used} / {plan.user_limit ?? 'nelimitat'} locuri
              ocupate
            </Text>
          ) : null}
          <Text style={styles.detail}>
            {subscription?.ends_at
              ? `Valabil până la ${formatCompanyDateTime(subscription.ends_at)}`
              : subscription
                ? 'Fără dată de expirare'
                : 'Detaliile abonamentului nu sunt disponibile'}
          </Text>
        </View>
      </View>
      {onManage ? (
        <View>
          <SectionDivider style={styles.divider} />
          <ActionTile
            label="Gestionează abonamentul"
            icon="settings-outline"
            variant="row"
            onPress={onManage}
          />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.menu.surface,
    borderWidth: 0,
    padding: theme.spacing.md,
  },
  overview: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  details: { flex: 1, gap: theme.spacing.xs, minWidth: 0 },
  heading: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  title: {
    color: theme.colors.menu.text,
    flexGrow: 1,
    flexShrink: 1,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.bodySmall,
  },
  detail: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.label,
  },
  status: {
    alignItems: 'center',
    borderRadius: theme.radius.sm,
    flexDirection: 'row',
    gap: theme.spacing.xs,
    padding: theme.spacing.xs,
  },
  statusLabel: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.typography.label,
  },
  divider: {
    backgroundColor: theme.colors.menu.border,
    marginBottom: 0,
    marginTop: theme.spacing.md,
  },
});
