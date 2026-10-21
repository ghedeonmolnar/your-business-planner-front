import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { Card } from '@/shared/components/Card';
import {
  useAccountInvitations,
  useRevokeInvitation,
} from '@/features/company/hooks/useCompany';
import { plannerStyles as styles } from '@/features/bookings/components/plannerStyles';
import { QueryNotice } from '@/features/bookings/components/QueryNotice';
import { AppButton } from '@/shared/components/AppButton';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { showError } from '@/shared/feedback/showError';
import { formatCompanyDateTime } from '@/shared/utils/formatDate';

export function TeamInvitations() {
  const query = useAccountInvitations();
  const revoke = useRevokeInvitation();
  const items = query.data?.pages.flatMap(page => page.items) ?? [];
  return (
    <View style={styles.content}>
      <Text style={styles.subtitle}>Invitații neacceptate</Text>
      <QueryNotice
        loading={query.isLoading}
        error={query.error}
        empty={!items.length}
        retry={() => query.refetch()}
      />
      {items.map(item => (
        <Card key={item.id} style={styles.card}>
          <Text style={styles.text}>
            {item.name} · {item.email}
          </Text>
          <Text style={styles.muted}>
            {item.expired
              ? 'Expirată'
              : 'Valabilă până la ' + formatCompanyDateTime(item.expires_at)}
          </Text>
          {!item.expired ? (
            <AppButton
              label="Revocă invitația"
              variant="outline"
              disabled={revoke.isPending}
              onPress={() =>
                confirmAction({
                  title: 'Revoci invitația?',
                  message: item.email,
                  confirmLabel: 'Revocă invitația',
                  onConfirm: () =>
                    revoke.mutate(item.id, {
                      onError: error =>
                        showError(error, 'Nu am putut revoca invitația.'),
                    }),
                })
              }
            />
          ) : null}
        </Card>
      ))}
      {query.hasNextPage ? (
        <AppButton
          label="Mai multe invitații"
          disabled={query.isFetchingNextPage}
          onPress={() => query.fetchNextPage()}
        />
      ) : null}
    </View>
  );
}
