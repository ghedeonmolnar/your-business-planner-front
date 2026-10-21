import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Card } from '@/shared/components/Card';
import { DirectoryItem, DirectoryKind } from '@/features/company/types';
import { useDirectory } from '@/features/company/hooks/useCompany';
import { DirectoryForm } from '@/features/company/components/DirectoryForm';
import { plannerStyles as styles } from '@/features/bookings/components/plannerStyles';
import { QueryNotice } from '@/features/bookings/components/QueryNotice';
import { AppButton } from '@/shared/components/AppButton';
import { Screen } from '@/shared/components/Screen';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/shared/navigation/types';
import { SearchField } from '@/shared/components/SearchField';

const titles = { clients: 'Clienți', employees: 'Personal', halls: 'Săli' };
export function DirectoryScreen({ kind }: { kind: DirectoryKind }) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [search, setSearch] = useState('');
  const query = useDirectory(kind, search);
  const [editing, setEditing] = useState<DirectoryItem | 'new' | null>(null);
  const items = query.data?.pages.flatMap(page => page.items) ?? [];
  return (
    <Screen>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.content}
        refreshing={query.isRefetching}
        onRefresh={() => query.refetch()}
        ListHeaderComponent={
          <View style={styles.content}>
            <Text style={styles.title}>{titles[kind]}</Text>
            {navigation.canGoBack() ? (
              <AppButton
                label="Înapoi"
                variant="ghost"
                onPress={() => navigation.goBack()}
              />
            ) : null}
            <AppButton label="Adaugă" onPress={() => setEditing('new')} />
            <SearchField
              value={search}
              onChange={setSearch}
              label="Caută în companie"
              placeholder="Nume sau telefon"
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
            <Text style={styles.muted}>{item.phone ?? item.address ?? ''}</Text>
            {item.capacity ? (
              <Text style={styles.text}>Capacitate: {item.capacity}</Text>
            ) : null}
            {item.is_active === false ? (
              <Text style={styles.text}>Arhivată / inactivă</Text>
            ) : null}
            <AppButton
              label="Editează"
              variant="outline"
              onPress={() => setEditing(item)}
            />
            {kind === 'clients' ? (
              <AppButton
                label="Istoric rezervări"
                variant="outline"
                onPress={() =>
                  navigation.navigate('CustomerHistory', { clientId: item.id })
                }
              />
            ) : null}
          </Card>
        )}
        ListFooterComponent={
          query.hasNextPage ? (
            <AppButton
              label="Încarcă mai multe"
              disabled={query.isFetchingNextPage}
              onPress={() => query.fetchNextPage()}
            />
          ) : null
        }
      />
      {editing ? (
        <DirectoryForm
          kind={kind}
          item={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </Screen>
  );
}
export function CustomersScreen() {
  return <DirectoryScreen kind="clients" />;
}
export function HallsScreen() {
  return <DirectoryScreen kind="halls" />;
}
export function StaffScreen() {
  return <DirectoryScreen kind="employees" />;
}
