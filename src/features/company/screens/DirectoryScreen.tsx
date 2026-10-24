import { ListItemSeparator } from '@/shared/components/ListItemSeparator';
import { PaginationFooter } from '@/shared/components/PaginationFooter';
import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import { DirectoryItem, DirectoryKind } from '@/features/company/types';
import { useDirectory } from '@/features/company/hooks/useCompany';
import { DirectoryForm } from '@/features/company/components/DirectoryForm';
import { contentStyles as styles } from '@/shared/components/contentStyles';
import { QueryState } from '@/shared/components/QueryState';
import { AppButton } from '@/shared/components/AppButton';
import { Screen } from '@/shared/components/Screen';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/shared/navigation/types';
import { SearchField } from '@/shared/components/SearchField';
import { DirectoryCard } from '@/features/company/components/DirectoryCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { ContentSection } from '@/shared/components/ContentSection';
import { IconButton } from '@/shared/components/IconButton';

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
        ItemSeparatorComponent={ListItemSeparator}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.content}
        refreshing={query.isRefetching && !query.isFetchingNextPage}
        onRefresh={() => query.refetch()}
        ListHeaderComponent={
          <View style={styles.header}>
            <ContentSection
              title={titles[kind]}
              subtitle={descriptions[kind]}
              size="page"
              leading={
                kind !== 'clients' && navigation.canGoBack() ? (
                  <IconButton
                    icon="arrow-back"
                    accessibilityLabel="Înapoi"
                    onPress={() => navigation.goBack()}
                  />
                ) : undefined
              }
              action={
                <AppButton
                  icon="add"
                  label={addLabels[kind]}
                  onPress={() => setEditing('new')}
                />
              }
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
            <QueryState
              loading={query.isLoading}
              hasData={items.length > 0}
              error={query.isFetchNextPageError ? undefined : query.error}
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
                  : descriptions[kind]
              }
              action={
                debouncedSearch
                  ? { label: 'Golește căutarea', onPress: () => setSearch('') }
                  : { label: addLabels[kind], onPress: () => setEditing('new') }
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
          <PaginationFooter
            hasMore={Boolean(query.hasNextPage)}
            loading={query.isFetchingNextPage}
            error={query.isFetchNextPageError ? query.error : undefined}
            onLoadMore={() => query.fetchNextPage()}
            label="Încarcă mai multe"
          />
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
export function StaffScreen() {
  return <DirectoryScreen kind="employees" />;
}
