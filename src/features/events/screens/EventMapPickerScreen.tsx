import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EventMapWebView } from '@/features/events/components/EventMapWebView';
import { useEvent } from '@/features/events/hooks/useEvents';
import {
  useEventMapMutations,
  useEventMapSelector,
} from '@/features/events/hooks/useEventMapLocation';
import { useMapPickerSelection } from '@/features/events/hooks/useMapPickerSelection';
import { RootStackParamList } from '@/shared/navigation/types';
import { MapCoordinates } from '@/shared/types/mapLocation';
import { AppButton } from '@/shared/components/AppButton';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { IconButton } from '@/shared/components/IconButton';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/components/Screen';
import { showError } from '@/shared/feedback/showError';
import { getErrorMessage } from '@/shared/utils/errorMessage';
import { theme } from '@/shared/theme/theme';

const MAP_LOAD_TIMEOUT_MS = 30_000;
type Props = NativeStackScreenProps<RootStackParamList, 'EventMapPicker'>;

export function EventMapPickerScreen({ navigation, route }: Props) {
  const eventId = route.params.eventId;
  const eventQuery = useEvent(eventId);
  const selector = useEventMapSelector(eventId);
  const { save } = useEventMapMutations(eventId);
  const previewRef = useRef<((point: MapCoordinates | null) => void) | null>(
    null,
  );
  const selection = useMapPickerSelection(eventId, point =>
    previewRef.current?.(point),
  );
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const submitting = useRef(false);
  const url = selector.data?.url;

  useEffect(() => {
    if (!url || ready || failed) return;
    const timeout = setTimeout(() => setFailed(true), MAP_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [url, ready, failed, attempt]);

  const retry = () => {
    selection.reset();
    previewRef.current = null;
    setReady(false);
    setFailed(false);
    setAttempt(previous => previous + 1);
    selector.refetch();
    if (eventQuery.error) eventQuery.refetch();
  };

  const confirm = async () => {
    if (
      !selection.selection ||
      !selector.data ||
      submitting.current ||
      selection.isResolving ||
      !ready ||
      failed
    )
      return;
    submitting.current = true;
    try {
      await save.mutateAsync({
        selection: selection.selection,
        locationRevision: selector.data.location_revision,
      });
      navigation.goBack();
    } catch (error) {
      showError(error, 'Nu am putut confirma locația. Încearcă din nou.');
    } finally {
      submitting.current = false;
    }
  };

  const loadingError = selector.error ?? eventQuery.error;
  return (
    <Screen>
      <View style={styles.heading}>
        <IconButton
          accessibilityLabel="Închide harta fără salvare"
          disabled={save.isPending}
          icon="arrow-back"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.title}>Locația pe hartă</Text>
      </View>
      {loadingError || failed ? (
        <ErrorBanner
          message={
            loadingError
              ? getErrorMessage(loadingError, 'Nu am putut încărca harta.')
              : 'Nu am putut încărca Google Maps. Verifică conexiunea și încearcă din nou.'
          }
          onRetry={retry}
        />
      ) : null}
      {!loadingError &&
      !failed &&
      (!ready || selector.isFetching || eventQuery.isLoading) ? (
        <LoadingState />
      ) : null}
      {url &&
      eventQuery.data &&
      !selector.isFetching &&
      !loadingError &&
      !failed ? (
        <EventMapWebView
          key={attempt}
          onFailure={() => {
            setFailed(true);
            selection.reset();
          }}
          onReady={() => {
            setReady(true);
            selection.restore(eventQuery.data?.map_location);
          }}
          onSelection={candidate => {
            if (!submitting.current) selection.select(candidate);
          }}
          previewRef={previewRef}
          url={url}
        />
      ) : (
        <View style={styles.placeholder} />
      )}
      <View style={styles.footer}>
        <Text style={styles.explanation}>
          Locația scrisă în rezervare se păstrează. Pinul se salvează doar după
          confirmare.
        </Text>
        <AppButton
          disabled={
            !ready ||
            failed ||
            Boolean(loadingError) ||
            !selection.selection ||
            selection.isResolving ||
            save.isPending
          }
          icon="checkmark-outline"
          label={
            save.isPending
              ? 'Se confirmă…'
              : selection.isResolving
                ? 'Se verifică locația…'
                : 'Confirmă locația'
          }
          multiline
          onPress={confirm}
        />
        <AppButton
          disabled={save.isPending}
          label="Anulează"
          onPress={() => navigation.goBack()}
          variant="ghost"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  title: {
    flex: 1,
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.sectionTitle,
  },
  placeholder: { flex: 1 },
  footer: { padding: theme.spacing.lg, gap: theme.spacing.sm },
  explanation: {
    color: theme.colors.muted,
    fontSize: theme.typography.bodySmall,
  },
});
