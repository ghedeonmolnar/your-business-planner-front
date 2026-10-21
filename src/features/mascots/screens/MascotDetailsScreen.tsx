import React from 'react';
import { FlatList, Image, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/shared/navigation/types';
import { TeamEventCard } from '@/shared/components/TeamEventCard';
import { useMascotProfile } from '@/features/mascots/hooks/useMascots';
import { mascotDetailsStyles as styles } from '@/features/mascots/screens/mascotDetailsStyles';
import { isUnauthorizedError } from '@/shared/api/client';
import { Card } from '@/shared/components/Card';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { IconButton } from '@/shared/components/IconButton';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/components/Screen';
import { theme } from '@/shared/theme/theme';
import { formatLongDate } from '@/shared/utils/formatDate';
import { formatExactMoney } from '@/shared/utils/money';
import { getErrorMessage } from '@/shared/utils/errorMessage';

type MascotDetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'MascotDetails'
>;

export function MascotDetailsScreen({
  navigation,
  route,
}: MascotDetailsScreenProps) {
  const profileQuery = useMascotProfile(route.params.mascotId);
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
                'Nu am putut încărca profilul mascotei.',
              )}
              onRetry={() => profileQuery.refetch()}
            />
          ) : (
            <EmptyState
              icon="calendar-outline"
              message="Evenimentele la care participă mascota vor apărea aici."
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
              <Text style={styles.navigationTitle}>Profil mascotă</Text>
            </View>

            {profile ? (
              <>
                <View style={styles.titleRow}>
                  <View style={styles.avatar}>
                    {profile.image_url ? (
                      <Image
                        source={{ uri: profile.image_url }}
                        style={styles.image}
                      />
                    ) : (
                      <Ionicons
                        name="sparkles-outline"
                        size={32}
                        color={theme.colors.accent}
                      />
                    )}
                  </View>
                  <View style={styles.titleArea}>
                    <Text style={styles.eyebrow}>MASCOTĂ</Text>
                    <Text style={styles.title}>{profile.name}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      profile.is_active
                        ? styles.activeBadge
                        : styles.inactiveBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        profile.is_active
                          ? styles.activeText
                          : styles.inactiveText,
                      ]}
                    >
                      {profile.is_active ? 'Activă' : 'Inactivă'}
                    </Text>
                  </View>
                </View>

                <Card style={styles.detailsCard}>
                  <Text style={styles.sectionTitle}>Detalii mascotă</Text>
                  <View style={styles.detailsGrid}>
                    <Detail
                      label="Preț pe oră"
                      value={formatExactMoney(profile.price_per_hour)}
                    />
                    <Detail
                      label="Adăugată din"
                      value={formatLongDate(profile.created_at)}
                    />
                  </View>
                </Card>

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
              item.employee_names.length
                ? item.employee_names.join(', ')
                : 'Fără angajat'
            }
          />
        )}
      />
    </Screen>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}
