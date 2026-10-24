import { ListItemSeparator } from '@/shared/components/ListItemSeparator';
import { PaginationFooter } from '@/shared/components/PaginationFooter';
import { useAuth } from '@/features/auth/AuthProvider';
import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import { RecordCard } from '@/shared/components/RecordCard';
import { MetaPill } from '@/shared/components/MetaPill';
import { ContentSection } from '@/shared/components/ContentSection';
import { IconButton } from '@/shared/components/IconButton';
import {
  useTeam,
  useBlockAccount,
  useUnblockAccount,
} from '@/features/company/hooks/useCompany';
import { AccountInvitationForm } from '@/features/company/components/AccountInvitationForm';
import { contentStyles as styles } from '@/shared/components/contentStyles';
import { QueryState } from '@/shared/components/QueryState';
import { AppButton } from '@/shared/components/AppButton';
import { Screen } from '@/shared/components/Screen';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { showError } from '@/shared/feedback/showError';
import { useNavigation } from '@react-navigation/native';
import { TeamInvitations } from '@/features/company/components/TeamInvitations';

export function TeamScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const query = useTeam();
  const block = useBlockAccount();
  const unblock = useUnblockAccount();
  const [inviting, setInviting] = useState(false);
  const items = query.data?.pages.flatMap(page => page.items) ?? [];
  return (
    <Screen>
      <FlatList
        data={items}
        ItemSeparatorComponent={ListItemSeparator}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <ContentSection
              title="Conturile companiei"
              size="page"
              subtitle={
                user?.plan
                  ? `${user.plan.users_used} / ${user.plan.user_limit ?? 'nelimitat'} locuri ocupate`
                  : undefined
              }
              leading={
                <IconButton
                  icon="arrow-back"
                  accessibilityLabel="Înapoi"
                  onPress={() => navigation.goBack()}
                />
              }
              action={
                <AppButton
                  label="Invită o persoană"
                  onPress={() => setInviting(true)}
                />
              }
            />
            <QueryState
              loading={query.isLoading}
              hasData={items.length > 0}
              error={query.isFetchNextPageError ? undefined : query.error}
              empty={!items.length}
              retry={() => query.refetch()}
            />
          </View>
        }
        renderItem={({ item }) => (
          <RecordCard
            title={item.name}
            subtitle={item.email}
            badge={
              <MetaPill
                label={
                  item.role === 'owner'
                    ? 'Proprietar'
                    : item.role === 'admin'
                      ? 'Administrator'
                      : 'Angajat'
                }
                tone="primary"
              />
            }
          >
            {item.blocked ? <MetaPill label="Blocat" tone="danger" /> : null}
            {item.blocked ? (
              <AppButton
                label="Reactivează accesul"
                loading={unblock.isPending}
                onPress={() =>
                  unblock.mutate(item.id, {
                    onError: error =>
                      showError(error, 'Nu am putut reactiva accesul.'),
                  })
                }
              />
            ) : null}
            {item.role !== 'owner' && !item.blocked ? (
              <AppButton
                label="Revocă accesul"
                variant="outline"
                loading={block.isPending}
                onPress={() =>
                  confirmAction({
                    title: 'Revoci accesul?',
                    message: item.name,
                    confirmLabel: 'Revocă accesul',
                    onConfirm: () =>
                      block.mutate(item.id, {
                        onError: error =>
                          showError(error, 'Nu am putut revoca accesul.'),
                      }),
                  })
                }
              />
            ) : null}
          </RecordCard>
        )}
        ListFooterComponent={
          <>
            <PaginationFooter
              hasMore={Boolean(query.hasNextPage)}
              loading={query.isFetchingNextPage}
              error={query.isFetchNextPageError ? query.error : undefined}
              onLoadMore={() => query.fetchNextPage()}
              label="Mai multe conturi"
            />
            <TeamInvitations />
          </>
        }
      />
      {inviting ? (
        <AccountInvitationForm onClose={() => setInviting(false)} />
      ) : null}
    </Screen>
  );
}
