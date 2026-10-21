import React, { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import dayjs from 'dayjs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/shared/navigation/types';
import { useAuth } from '@/features/auth/AuthProvider';
import { EmployeeAgendaCalendar } from '@/features/employeeWorkspace/components/EmployeeAgendaCalendar';
import { EmployeeEventCard } from '@/features/employeeWorkspace/components/EmployeeEventCard';
import {
  useEmployeeEventsList,
  useEmployeeMonthEvents,
} from '@/features/employeeWorkspace/hooks/useEmployeeWorkspace';
import { EmployeeEvent } from '@/features/employeeWorkspace/types';
import { isUnauthorizedError } from '@/shared/api/client';
import { AppSegmentedControl } from '@/shared/components/AppSegmentedControl';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { IconButton } from '@/shared/components/IconButton';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/components/Screen';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { showError } from '@/shared/feedback/showError';
import { theme } from '@/shared/theme/theme';
import { getErrorMessage } from '@/shared/utils/errorMessage';

export function EmployeeEventsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { signOut } = useAuth();
  const [mode, setMode] = useState<'calendar' | 'list'>('calendar');
  const [timeframe, setTimeframe] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format('YYYY-MM-DD'),
  );
  const [visibleMonth, setVisibleMonth] = useState(dayjs().format('YYYY-MM'));
  const monthQuery = useEmployeeMonthEvents(visibleMonth, mode === 'calendar');
  const listQuery = useEmployeeEventsList({ timeframe }, mode === 'list');
  const events = listQuery.data?.pages.flatMap(page => page.items) ?? [];
  const openEvent = (event: EmployeeEvent) =>
    navigation.navigate('EventDetails', { eventId: event.id });

  const logout = () =>
    confirmAction({
      title: 'Delogare',
      message: 'Sigur dorești să te deloghezi?',
      confirmLabel: 'Da',
      onConfirm: () =>
        signOut().catch(error =>
          showError(error, 'Nu am putut închide sesiunea.'),
        ),
    });

  const emptyList = listQuery.isLoading ? (
    <LoadingState />
  ) : listQuery.error ? undefined : (
    <EmptyState
      icon="calendar-outline"
      title="Nu ai evenimente"
      message="Evenimentele alocate vor apărea aici."
    />
  );

  const header = (
    <View>
      <ScreenHeader
        action={
          <IconButton
            accessibilityLabel="Delogare"
            icon="log-out-outline"
            onPress={logout}
          />
        }
        eyebrow="Programul meu"
        title="Evenimente"
      />
      <AppSegmentedControl
        onChangeIndex={index => setMode(index === 0 ? 'calendar' : 'list')}
        selectedIndex={mode === 'calendar' ? 0 : 1}
        segments={[{ label: 'Calendar' }, { label: 'Listă' }]}
      />
      {mode === 'list' ? (
        <AppSegmentedControl
          containerStyle={styles.filter}
          onChangeIndex={index =>
            setTimeframe(index === 0 ? 'upcoming' : 'past')
          }
          selectedIndex={timeframe === 'upcoming' ? 0 : 1}
          segments={[{ label: 'Următoare' }, { label: 'Trecute' }]}
        />
      ) : null}
    </View>
  );

  return (
    <Screen>
      {mode === 'calendar' ? (
        <ScrollView contentContainerStyle={styles.content}>
          {header}
          <EmployeeAgendaCalendar
            error={monthQuery.error}
            events={monthQuery.data ?? []}
            loading={monthQuery.isLoading}
            onOpenEvent={openEvent}
            onRetry={() => monthQuery.refetch()}
            onSelectDate={setSelectedDate}
            onSelectMonth={month => {
              setVisibleMonth(month);
              setSelectedDate(`${month}-01`);
            }}
            selectedDate={selectedDate}
          />
        </ScrollView>
      ) : (
        <FlatList
          ListHeaderComponent={header}
          ListEmptyComponent={emptyList}
          ListFooterComponent={
            listQuery.isFetchingNextPage ? <LoadingState /> : undefined
          }
          contentContainerStyle={styles.content}
          data={events}
          keyExtractor={event => event.id}
          onEndReached={() => {
            if (listQuery.hasNextPage && !listQuery.isFetchingNextPage) {
              listQuery.fetchNextPage();
            }
          }}
          onRefresh={() => listQuery.refetch()}
          refreshing={listQuery.isRefetching}
          renderItem={({ item }) => (
            <EmployeeEventCard event={item} onDetails={openEvent} />
          )}
          ListHeaderComponentStyle={styles.header}
        />
      )}
      {mode === 'list' &&
      listQuery.error &&
      !isUnauthorizedError(listQuery.error) ? (
        <ErrorBanner
          message={getErrorMessage(
            listQuery.error,
            'Nu am putut încărca evenimentele.',
          )}
          onRetry={() => listQuery.refetch()}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xl },
  filter: { marginTop: theme.spacing.md },
  header: { marginBottom: theme.spacing.lg },
});
