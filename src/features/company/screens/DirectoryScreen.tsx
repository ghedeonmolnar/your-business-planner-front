import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import { Text } from 'react-native-paper';
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
import { DirectoryCard } from '@/features/company/components/DirectoryCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';

const titles = { clients: 'Clienți', employees: 'Personal', halls: 'Săli' };
const SEARCH_DELAY_MS = 300;
const addLabels = {
  clients: 'Adaugă client',
  employees: 'Adaugă persoană',
  halls: 'Adaugă sală',
};
const descriptions = {
  clients: 'Date de contact și istoricul rezervărilor.',
  employees: 'Echipa care participă la evenimentele tale.',
  halls: 'Capacitatea și disponibilitatea spațiilor tale.',
};
export function DirectoryScreen({ kind }: { kind: DirectoryKind }) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, SEARCH_DELAY_MS);
  const query = useDirectory(kind, debouncedSearch);
  const [editing, setEditing] = useState<DirectoryItem | 'new' | null>(null);
  const items = query.data?.pages.flatMap(page => page.items) ?? [];
  return (
    <Screen>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.content}
        refreshing={query.isRefetching && !query.isFetchingNextPage}
        onRefresh={() => query.refetch()}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>{titles[kind]}</Text>
            <Text style={styles.muted}>{descriptions[kind]}</Text>
            {kind !== 'clients' && navigation.canGoBack() ? (
              <AppButton
                label="Înapoi"
                variant="ghost"
                onPress={() => navigation.goBack()}
              />
            ) : null}
            <AppButton
              icon="add"
              label={addLabels[kind]}
              onPress={() => setEditing('new')}
            />
            <SearchField
              value={search}
              onChange={setSearch}
              label={'Caută în ' + titles[kind].toLowerCase()}
              placeholder={
                kind === 'clients'
                  ? 'Caută după nume sau telefon'
                  : 'Caută după nume'
              }
            />
            <QueryNotice
              loading={query.isLoading}
              error={query.error}
              retry={() => query.refetch()}
            />
          </View>
        }
        ListEmptyComponent={
          !query.isLoading && !query.error ? (
            <EmptyState
              icon={
                kind === 'clients'
                  ? 'people-outline'
                  : kind === 'halls'
                    ? 'business-outline'
                    : 'person-outline'
              }
              title={
                debouncedSearch
                  ? 'Niciun rezultat'
                  : 'Începe cu prima înregistrare'
              }
              message={
                debouncedSearch
                  ? 'Încearcă un alt nume sau golește căutarea.'
                  : descriptions[kind] +
                    ' Folosește butonul de adăugare pentru a începe.'
              }
            />
          ) : undefined
        }
        renderItem={({ item }) => (
          <DirectoryCard
            item={item}
            kind={kind}
            onEdit={() => setEditing(item)}
            onHistory={() =>
              navigation.navigate('CustomerHistory', { clientId: item.id })
            }
          />
        )}
        ListFooterComponent={
          query.hasNextPage ? (
            <AppButton
              label="Încarcă mai multe"
              disabled={query.isFetchingNextPage}
              onPress={() => query.fetchNextPage()}
            />
          ) : undefined
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
export { CustomersScreen } from '@/features/company/screens/CustomersScreen';
export function HallsScreen() {
  return <DirectoryScreen kind="halls" />;
}
export function StaffScreen() {
  return <DirectoryScreen kind="employees" />;
}
