import { PaginationFooter } from '@/shared/components/PaginationFooter';
import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { RecordCard } from '@/shared/components/RecordCard';
import { MetaPill } from '@/shared/components/MetaPill';
import { ContentSection } from '@/shared/components/ContentSection';
import {
  useAccountInvitations,
  useRevokeInvitation,
} from '@/features/company/hooks/useCompany';
import { contentStyles as styles } from '@/shared/components/contentStyles';
import { QueryState } from '@/shared/components/QueryState';
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
      <ContentSection title="Invitații neacceptate" />
      <QueryState
        loading={query.isLoading}
        hasData={items.length > 0}
        error={query.isFetchNextPageError ? undefined : query.error}
        empty={!items.length}
        retry={() => query.refetch()}
      />
      {items.map(item => (
        <RecordCard
          key={item.id}
          title={item.name}
          subtitle={item.email}
          badge={
            item.expired ? (
              <MetaPill label="Expirată" tone="danger" />
            ) : undefined
          }
        >
          <Text style={styles.muted}>
            {item.expired
              ? 'Expirată'
              : 'Valabilă până la ' + formatCompanyDateTime(item.expires_at)}
          </Text>
          <Text style={styles.text}>
            {item.delivery_status === 'sent'
              ? 'Email expediat'
              : item.delivery_status === 'failed'
                ? 'Expedierea a eșuat; se reîncearcă automat.'
                : item.delivery_status === 'pending'
                  ? 'Invitație salvată · Email în curs de expediere'
                  : ''}
          </Text>
          {!item.expired ? (
            <AppButton
              label="Revocă invitația"
              variant="outline"
              loading={revoke.isPending}
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
        </RecordCard>
      ))}
      <PaginationFooter
        hasMore={Boolean(query.hasNextPage)}
        loading={query.isFetchingNextPage}
        error={query.isFetchNextPageError ? query.error : undefined}
        onLoadMore={() => query.fetchNextPage()}
        label="Mai multe invitații"
      />
    </View>
  );
}
