import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useCatalogs } from '@/features/catalogs/hooks/useCatalogs';
import {
  createCatalogLabelMap,
  getCatalogLabel,
} from '@/features/catalogs/utils/catalogLabels';
import { eventDetailsStyles } from '@/features/events/components/eventDetailsStyles';
import { EventReview } from '@/features/events/types';
import { AppButton } from '@/shared/components/AppButton';
import { MetaPill } from '@/shared/components/MetaPill';
import { theme } from '@/shared/theme/theme';

type EventReviewSectionProps = {
  review: EventReview | null;
  loading: boolean;
  sending: boolean;
  onSend: () => void;
};

export function EventReviewSection({
  review,
  loading,
  sending,
  onSend,
}: EventReviewSectionProps) {
  const catalogsQuery = useCatalogs();
  const sourceLabels = createCatalogLabelMap(
    catalogsQuery.data?.client_sources,
  );
  const isSubmitted = Boolean(review?.submitted_at);
  let websiteConsentLabel = 'Necompletat';

  if (review?.website_consent === true) {
    websiteConsentLabel = 'Da';
  } else if (review?.website_consent === false) {
    websiteConsentLabel = 'Nu';
  }

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Recenzie primită</Text>

      {isSubmitted && review ? (
        <View style={eventDetailsStyles.row}>
          <View style={eventDetailsStyles.rowMain}>
            <MetaPill
              icon="star"
              label={`Animatori ${review.entertainers_rating ?? '-'}/5`}
            />
            <Text style={eventDetailsStyles.rowMeta}>
              Nume: {review.reviewer_name || 'Necompletat'}
            </Text>
            <Text style={eventDetailsStyles.rowMeta}>
              A aflat de noi:{' '}
              {review.source_details?.trim()
                ? review.source_details
                : getCatalogLabel(sourceLabels, review.source) || 'Necompletat'}
            </Text>
            {review.entertainers_comment ? (
              <Text style={eventDetailsStyles.rowMeta}>
                Despre animatori: {review.entertainers_comment}
              </Text>
            ) : null}
            {review.improvement_suggestion ? (
              <Text style={eventDetailsStyles.rowMeta}>
                De îmbunătățit: {review.improvement_suggestion}
              </Text>
            ) : null}
            <Text style={eventDetailsStyles.rowMeta}>
              Permisiune pentru site: {websiteConsentLabel}
            </Text>
          </View>
        </View>
      ) : (
        <>
          <Text style={eventDetailsStyles.emptyText}>
            {review
              ? 'Linkul a fost trimis, dar clientul nu a completat încă recenzia.'
              : 'Trimite clientului un link prin care poate lăsa o recenzie.'}
          </Text>
          <AppButton
            color={theme.colors.success}
            disabled={loading || sending}
            fullWidth
            icon="logo-whatsapp"
            label={
              review
                ? 'Trimite din nou linkul de recenzie'
                : 'Trimite link de recenzie'
            }
            onPress={onSend}
            style={styles.button}
            variant="outline"
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 0,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.subtitle,
  },
  button: {
    marginTop: theme.spacing.md,
  },
});
