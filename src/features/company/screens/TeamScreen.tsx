import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Card } from '@/shared/components/Card';
import {
  useTeam,
  useBlockAccount,
  useUnblockAccount,
} from '@/features/company/hooks/useCompany';
import { AccountInvitationForm } from '@/features/company/components/AccountInvitationForm';
import { plannerStyles as styles } from '@/features/bookings/components/plannerStyles';
import { QueryNotice } from '@/features/bookings/components/QueryNotice';
import { AppButton } from '@/shared/components/AppButton';
import { Screen } from '@/shared/components/Screen';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { showError } from '@/shared/feedback/showError';
import { useNavigation } from '@react-navigation/native';
import { TeamInvitations } from '@/features/company/components/TeamInvitations';

export function TeamScreen() {
  const navigation = useNavigation();
  const query = useTeam();
  const block = useBlockAccount();
  const unblock = useUnblockAccount();
  const [inviting, setInviting] = useState(false);
  const items = query.data?.pages.flatMap(page => page.items) ?? [];
  return (
    <Screen>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.content}>
            <AppButton
              label="Înapoi"
              variant="ghost"
              onPress={() => navigation.goBack()}
            />
            <Text style={styles.title}>Conturile companiei</Text>
            <AppButton
              label="Invită o persoană"
              onPress={() => setInviting(true)}
            />
            <QueryNotice
              loading={query.isLoading}
              error={query.error}
              empty={!items.length}
              retry={() => query.refetch()}
            />
          </View>
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={styles.subtitle}>{item.name}</Text>
            <Text style={styles.text}>{item.email}</Text>
            <Text style={styles.muted}>
              {item.role === 'owner'
                ? 'Proprietar'
                : item.role === 'admin'
                  ? 'Administrator'
                  : 'Angajat'}
              {item.blocked ? ' · Blocat' : ''}
            </Text>
            {item.blocked ? (
              <AppButton
                label="Reactivează accesul"
                disabled={unblock.isPending}
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
                disabled={block.isPending}
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
          </Card>
        )}
        ListFooterComponent={
          <>
            {query.hasNextPage ? (
              <AppButton
                label="Mai multe conturi"
                disabled={query.isFetchingNextPage}
                onPress={() => query.fetchNextPage()}
              />
            ) : null}
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
