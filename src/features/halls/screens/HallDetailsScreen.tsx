import React, { useRef, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useHall, useHallMutations } from '@/features/halls/hooks/useHalls';
import { HallScreenHeader } from '@/features/halls/components/HallScreenHeader';
import { HallGallery } from '@/features/halls/components/HallGallery';
import { HallSummary } from '@/features/halls/components/HallSummary';
import { HallConfiguration } from '@/features/halls/components/HallConfiguration';
import { HallFacilities } from '@/features/halls/components/HallFacilities';
import { HallNextBookings } from '@/features/halls/components/HallNextBookings';
import { HallActionsMenu } from '@/features/halls/components/HallActionsMenu';
import { HallDetailsLoading } from '@/features/halls/components/HallDetailsLoading';
import { hallStyles as styles } from '@/features/halls/components/hallStyles';
import { RootStackParamList } from '@/shared/navigation/types';
import { Screen } from '@/shared/components/Screen';
import { QueryState } from '@/shared/components/QueryState';
import { AppButton } from '@/shared/components/AppButton';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { showError } from '@/shared/feedback/showError';
import { getSessionGeneration } from '@/shared/api/sessionExpiry';

export function HallDetailsScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'HallDetails'>) {
  const query = useHall(route.params.hallId);
  const mutations = useHallMutations();
  const submitting = useRef(false);
  const [sessionGeneration] = useState(getSessionGeneration);
  const hall = query.data;
  const busy =
    mutations.status.isPending ||
    mutations.remove.isPending ||
    Boolean(query.error) ||
    query.isFetching;
  const availability = () =>
    navigation.navigate('HallAvailability', { hallId: route.params.hallId });
  const edit = () =>
    navigation.navigate('HallForm', { hallId: route.params.hallId });
  const changeStatus = () => {
    if (!hall || busy || submitting.current) return;
    confirmAction({
      title: hall.is_active ? 'Dezactivezi sala?' : 'Reactivezi sala?',
      message: hall.is_active
        ? 'Sala nu va mai putea fi selectată pentru rezervări noi. Rezervările existente și istoricul se păstrează.'
        : 'Sala va putea fi selectată pentru rezervări noi.',
      confirmLabel: hall.is_active ? 'Dezactivează' : 'Reactivează',
      onConfirm: () => {
        if (submitting.current || sessionGeneration !== getSessionGeneration())
          return;
        submitting.current = true;
        mutations.status.mutate(
          { id: hall.id, active: !hall.is_active, version: hall.version },
          {
            onError: error => {
              if (sessionGeneration !== getSessionGeneration()) return;
              showError(error, 'Nu am putut schimba starea sălii.');
              query.refetch();
            },
            onSettled: () => {
              submitting.current = false;
            },
          },
        );
      },
    });
  };
  const remove = () => {
    if (!hall?.permissions.can_delete || busy || submitting.current) return;
    confirmAction({
      title: 'Ștergi sala?',
      message: `Sala „${hall.name}” va fi eliminată din listă. Operațiunea este permisă numai dacă nu există rezervări asociate.`,
      confirmLabel: 'Șterge sala',
      onConfirm: () => {
        if (submitting.current || sessionGeneration !== getSessionGeneration())
          return;
        submitting.current = true;
        mutations.remove.mutate(
          { id: hall.id, version: hall.version },
          {
            onSuccess: () => {
              if (sessionGeneration === getSessionGeneration())
                navigation.goBack();
            },
            onError: error => {
              if (sessionGeneration !== getSessionGeneration()) return;
              showError(error, 'Nu am putut șterge sala.');
              query.refetch();
            },
            onSettled: () => {
              submitting.current = false;
            },
          },
        );
      },
    });
  };
  return (
    <Screen>
      <HallScreenHeader
        title="Detalii sală"
        subtitle="Administrare spații"
        onBack={() => navigation.goBack()}
        trailing={
          hall ? (
            <HallActionsMenu
              hall={hall}
              busy={busy}
              onEdit={edit}
              onAvailability={availability}
              onDuplicate={() =>
                navigation.navigate('HallForm', { duplicateHallId: hall.id })
              }
              onStatus={changeStatus}
              onDelete={remove}
            />
          ) : undefined
        }
      />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={() => query.refetch()}
          />
        }
      >
        {query.isLoading ? (
          <HallDetailsLoading />
        ) : (
          <QueryState
            loading={false}
            error={query.error}
            hasData={Boolean(hall)}
            retry={() => query.refetch()}
          />
        )}
        {query.error && hall ? (
          <Text style={styles.subtitle}>
            Datele afișate sunt cele încărcate anterior. Reîncearcă înainte de a
            modifica sala.
          </Text>
        ) : null}
        {hall ? (
          <>
            {hall.images.length ? <HallGallery hall={hall} /> : null}
            <HallSummary hall={hall} />
            <AppButton
              label="Verifică disponibilitatea"
              icon="calendar-outline"
              fullWidth
              variant="soft"
              onPress={availability}
            />
            <HallFacilities
              hall={hall}
              onEdit={hall.permissions.can_edit && !busy ? edit : undefined}
            />
            <HallNextBookings
              hall={hall}
              onAll={() =>
                navigation.navigate('HallBookings', { hallId: hall.id })
              }
              onOpen={eventId =>
                navigation.navigate('EventDetails', { eventId })
              }
            />
            <HallConfiguration hall={hall} onAvailability={availability} />
          </>
        ) : null}
      </ScrollView>
      {hall?.permissions.can_edit ? (
        <View style={styles.footer}>
          <AppButton
            label="Editează sala"
            icon="create-outline"
            fullWidth
            disabled={busy}
            onPress={edit}
          />
        </View>
      ) : null}
    </Screen>
  );
}
