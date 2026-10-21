import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/shared/navigation/types';
import { EmployeeEventCard } from '@/features/employeeWorkspace/components/EmployeeEventCard';
import { useEmployeeEvent } from '@/features/employeeWorkspace/hooks/useEmployeeWorkspace';
import { isUnauthorizedError } from '@/shared/api/client';
import { Card } from '@/shared/components/Card';
import { EventMapButton } from '@/shared/components/EventMapButton';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { IconButton } from '@/shared/components/IconButton';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/components/Screen';
import { getErrorMessage } from '@/shared/utils/errorMessage';
import { theme } from '@/shared/theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EventDetails'>;

export function EmployeeEventDetailsScreen({ navigation, route }: Props) {
  const eventQuery = useEmployeeEvent(route.params.eventId);
  const event = eventQuery.data;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          <IconButton
            accessibilityLabel="Înapoi"
            icon="arrow-back"
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.title}>Detalii eveniment</Text>
        </View>
        {eventQuery.isLoading ? <LoadingState /> : null}
        {eventQuery.error && !isUnauthorizedError(eventQuery.error) ? (
          <ErrorBanner
            message={getErrorMessage(
              eventQuery.error,
              'Nu am putut încărca evenimentul.',
            )}
            onRetry={() => eventQuery.refetch()}
          />
        ) : null}
        {event ? (
          <>
            <EmployeeEventCard event={event} />
            <EventMapButton event={event} />
            <Card>
              <Text style={styles.sectionTitle}>Echipă și program</Text>
              <Text style={styles.row}>
                Costumul meu: {event.mascot?.name ?? 'Nealocat'}
              </Text>
              <Text style={styles.row}>
                Colegi:{' '}
                {event.coworkers.map(person => person.name).join(', ') ||
                  'Fără colegi'}
              </Text>
              <Text style={styles.row}>
                Durata: {event.duration_minutes} minute
              </Text>
              <Text style={styles.row}>
                Tip eveniment: {event.type_label ?? 'Nespecificat'}
              </Text>
            </Card>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xl },
  heading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  title: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.sectionTitle,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.subtitle,
  },
  row: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    marginTop: theme.spacing.md,
  },
});
