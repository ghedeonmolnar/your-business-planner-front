import React, { useState } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useHall } from '@/features/halls/hooks/useHalls';
import { HallEditor } from '@/features/halls/components/HallEditor';
import { HallScreenHeader } from '@/features/halls/components/HallScreenHeader';
import { hallStyles as styles } from '@/features/halls/components/hallStyles';
import { RootStackParamList } from '@/shared/navigation/types';
import { Screen } from '@/shared/components/Screen';
import { QueryState } from '@/shared/components/QueryState';

export function HallFormScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'HallForm'>) {
  const sourceId = route.params.hallId ?? route.params.duplicateHallId;
  const duplicate = Boolean(route.params.duplicateHallId);
  const query = useHall(sourceId);
  const [busy, setBusy] = useState(false);
  const allowed =
    !sourceId ||
    (duplicate
      ? query.data?.permissions.can_duplicate
      : query.data?.permissions.can_edit);
  const ready = !sourceId || Boolean(query.data);
  return (
    <Screen>
      <HallScreenHeader
        title={
          route.params.hallId
            ? 'Editează sală'
            : duplicate
              ? 'Duplică sală'
              : 'Adaugă sală'
        }
        onBack={() => {
          if (!busy) navigation.goBack();
        }}
      />
      {sourceId && (query.isLoading || query.error || !allowed) ? (
        <View style={styles.content}>
          <QueryState
            loading={query.isLoading}
            error={query.error}
            retry={() => query.refetch()}
          />
          {!query.isLoading && !query.error && !allowed ? (
            <Text style={styles.body}>
              Nu ai permisiunea de a modifica această sală.
            </Text>
          ) : null}
          {query.data && query.error ? (
            <Text style={styles.subtitle}>
              Ciorna este păstrată. Reîncearcă încărcarea înainte de salvare.
            </Text>
          ) : null}
        </View>
      ) : null}
      {ready && allowed ? (
        <HallEditor
          key={sourceId ?? 'new'}
          hall={query.data}
          duplicate={duplicate}
          blocked={Boolean(query.error)}
          navigation={navigation}
          onBusy={setBusy}
          onReload={async () => {
            const result = await query.refetch();
            if (result.error) throw result.error;
            return result.data;
          }}
        />
      ) : null}
    </Screen>
  );
}
