import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/shared/navigation/types';
import { TeamEventCard } from '@/shared/components/TeamEventCard';
import { EmployeeAccountCard } from '@/features/employees/components/EmployeeAccountCard';
import { EmployeeProfileSummary } from '@/features/employees/components/EmployeeProfileSummary';
import { useEmployeeProfile } from '@/features/employees/hooks/useEmployees';
import { compactMascotNames } from '@/features/mascots/utils/compactMascotNames';
import { isUnauthorizedError } from '@/shared/api/client';
import { Card } from '@/shared/components/Card';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { IconButton } from '@/shared/components/IconButton';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/components/Screen';
import { theme } from '@/shared/theme/theme';
import { formatExactMoney } from '@/shared/utils/money';
import { getErrorMessage } from '@/shared/utils/errorMessage';

type EmployeeDetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'EmployeeDetails'
>;

export function EmployeeDetailsScreen({
  navigation,
  route,
}: EmployeeDetailsScreenProps) {
  const profileQuery = useEmployeeProfile(route.params.employeeId);
  const profile = profileQuery.data;

  return (
    <Screen>
      <FlatList
        ListEmptyComponent={
          profileQuery.isLoading ? (
            <LoadingState />
          ) : profileQuery.error && !isUnauthorizedError(profileQuery.error) ? (
            <ErrorBanner
              message={getErrorMessage(
                profileQuery.error,
                'Nu am putut încărca profilul angajatului.',
              )}
              onRetry={() => profileQuery.refetch()}
            />
          ) : (
            <EmptyState
              icon="calendar-outline"
              message="Evenimentele la care participă angajatul vor apărea aici."
              title="Nu are evenimente încheiate"
            />
          )
        }
        ListHeaderComponent={
          <>
            <View style={styles.navigationRow}>
              <IconButton
                accessibilityLabel="Înapoi la echipă"
                icon="arrow-back"
                onPress={() => navigation.goBack()}
              />
              <Text style={styles.navigationTitle}>Profil angajat</Text>
            </View>

            {profile ? (
              <>
                <EmployeeProfileSummary profile={profile} />

                <EmployeeAccountCard profile={profile} />

                <Card style={styles.totalCard}>
                  <Text style={styles.totalLabel}>Câștig total</Text>
                  <Text style={styles.totalValue}>
                    {formatExactMoney(profile.total_earnings)}
                  </Text>
                  <Text style={styles.totalHint}>
                    De la toate evenimentele încheiate
                  </Text>
                </Card>

                <Text style={styles.eventsTitle}>Evenimente</Text>
              </>
            ) : null}
          </>
        }
        contentContainerStyle={styles.listContent}
        data={profile?.events ?? []}
        keyExtractor={event => event.id}
        onRefresh={() => profileQuery.refetch()}
        refreshing={profileQuery.isRefetching}
        renderItem={({ item }) => (
          <TeamEventCard
            address={item.address}
            date={item.date}
            durationMinutes={item.duration_minutes}
            earnings={item.earnings}
            location={item.location}
            onPress={() =>
              navigation.navigate('EventDetails', { eventId: item.id })
            }
            participantLabel={
              item.mascot_names.length
                ? compactMascotNames(item.mascot_names)
                : 'Fără mascotă'
            }
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  navigationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: theme.spacing.xl,
  },
  navigationTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.bodyLarge,
    marginLeft: theme.spacing.md,
  },
  totalCard: {
    backgroundColor: theme.colors.surfaceMuted,
    marginBottom: theme.spacing.xl,
  },
  totalLabel: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.meta,
  },
  totalValue: {
    color: theme.colors.success,
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.display,
    lineHeight: 39,
    marginTop: theme.spacing.xs,
  },
  totalHint: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.label,
    marginTop: theme.spacing.xs,
  },
  eventsTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.title,
    marginBottom: theme.spacing.md,
  },
});
