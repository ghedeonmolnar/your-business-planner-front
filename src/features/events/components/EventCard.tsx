import React from 'react';
import { Text } from 'react-native-paper';
import { TouchableOpacity, View } from 'react-native';
import { Event } from '@/features/events/types';
import { Card } from '@/shared/components/Card';
import { EditIconButton } from '@/shared/components/EditIconButton';
import { IconButton } from '@/shared/components/IconButton';
import { MetaPill } from '@/shared/components/MetaPill';
import { EventMapButton } from '@/shared/components/EventMapButton';
import { eventCardStyles as styles } from '@/features/events/components/eventCardStyles';
import { formatEventDate } from '@/shared/utils/formatDate';
import { eventContactPhone, openContact } from '@/shared/utils/contactLinks';
import { hasEventEnded } from '@/features/events/utils/eventCompletion';
import { compactMascotLabel } from '@/features/mascots/utils/compactMascotNames';
import { theme } from '@/shared/theme/theme';
import { formatMoney } from '@/shared/utils/money';

type EventCardProps = {
  event: Event;
  mascotLabel?: string;
  typeLabel?: string;
  showTypePill?: boolean;
  showMapAction?: boolean;
  onDetails?: (event: Event) => void;
  onEdit?: (event: Event) => void;
  onDelete?: (event: Event) => void;
  onSendReviewLink?: (event: Event) => void;
};

export function EventCard({
  event,
  mascotLabel,
  typeLabel,
  showTypePill = true,
  showMapAction = false,
  onDetails,
  onEdit,
  onDelete,
  onSendReviewLink,
}: EventCardProps) {
  const contactPhone = eventContactPhone(event);
  const canSendReviewLink = Boolean(
    onSendReviewLink && event.status !== 'cancelled' && hasEventEnded(event),
  );
  const mascotNames = event.mascots?.map(mascot => mascot.name).filter(Boolean);
  const fullMascotLabel =
    mascotLabel ??
    (mascotNames?.length ? mascotNames.join(', ') : (event.mascot?.name ?? ''));
  const displayedMascotLabel = compactMascotLabel(fullMascotLabel);
  const hasEnded = hasEventEnded(event);
  const moneyPill = hasEnded
    ? {
        label: formatMoney(Number(event.paid_amount) || 0),
        testID: 'event-paid-pill',
      }
    : {
        label: formatMoney(Number(event.balance_due) || 0),
        testID: 'event-balance-pill',
      };
  const hasManagementActions = Boolean(onEdit || onDelete);
  const canOpenMap = showMapAction && event.map_location?.confirmed;
  const detailsButtonProps = {
    accessibilityLabel: `Detalii eveniment ${event.location ?? 'fără locație'}`,
    accessibilityRole: onDetails ? ('button' as const) : undefined,
    activeOpacity: onDetails ? 0.72 : 1,
    disabled: !onDetails,
    onPress: onDetails ? () => onDetails(event) : undefined,
  };
  const pills = (
    <View style={styles.metaRow}>
      {showTypePill ? (
        <MetaPill
          label={typeLabel ?? event.type}
          style={styles.metaPill}
          testID="event-type-pill"
        />
      ) : null}
      <MetaPill
        color={theme.colors.success}
        icon="wallet-outline"
        label={moneyPill.label}
        style={styles.metaPill}
        testID={moneyPill.testID}
      />
      {displayedMascotLabel ? (
        <MetaPill
          label={displayedMascotLabel}
          style={[styles.metaPill, styles.mascotPill]}
          testID="event-mascots-pill"
        />
      ) : null}
    </View>
  );
  const contactActions = contactPhone ? (
    <View style={styles.contactActions}>
      <IconButton
        accessibilityLabel="Sună clientul"
        color={theme.colors.primary}
        icon="call-outline"
        onPress={() => openContact('call', contactPhone)}
      />
      <IconButton
        accessibilityLabel="Deschide WhatsApp"
        backgroundColor={theme.colors.surface}
        color={theme.colors.success}
        icon="logo-whatsapp"
        onPress={() => openContact('whatsapp', contactPhone)}
      />
    </View>
  ) : null;
  const secondaryActions = (
    <>
      {canOpenMap ? <EventMapButton compact event={event} /> : null}
      {canSendReviewLink && onSendReviewLink ? (
        <IconButton
          accessibilityLabel="Trimite link de recenzie"
          backgroundColor={theme.colors.orangeSoft}
          color={theme.colors.warning}
          icon="star-outline"
          onPress={() => onSendReviewLink(event)}
        />
      ) : null}
      {onEdit ? (
        <EditIconButton
          accessibilityLabel="Editează eveniment"
          onPress={() => onEdit(event)}
        />
      ) : null}
      {onDelete ? (
        <IconButton
          accessibilityLabel="Șterge eveniment"
          backgroundColor={theme.colors.redSoft}
          color={theme.colors.danger}
          icon="trash-outline"
          onPress={() => onDelete(event)}
        />
      ) : null}
    </>
  );

  return (
    <Card
      style={[
        styles.card,
        hasManagementActions ? styles.compactCard : undefined,
      ]}
    >
      <View style={styles.cardTop}>
        <TouchableOpacity
          {...detailsButtonProps}
          style={[
            styles.cardMain,
            contactPhone || hasManagementActions
              ? styles.cardMainWithActions
              : undefined,
          ]}
          testID="event-card-details"
        >
          <View style={styles.eventInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.name}>
                {event.location ?? 'Locație necompletată'}
              </Text>
              {event.address ? (
                <Text numberOfLines={2} style={styles.address}>
                  {event.address}
                </Text>
              ) : null}
            </View>
            <Text style={styles.dateText}>
              {formatEventDate(event.date, event.start_time, event.end_time)}
            </Text>
          </View>

          {hasManagementActions ? pills : null}
        </TouchableOpacity>

        {hasManagementActions ? (
          <View style={styles.actionGrid}>
            {contactActions}
            {secondaryActions}
          </View>
        ) : (
          contactActions
        )}
      </View>
      {!hasManagementActions ? (
        <View style={styles.footerRow}>
          <TouchableOpacity
            {...detailsButtonProps}
            style={styles.metaMain}
            testID="event-card-meta-details"
          >
            {pills}
          </TouchableOpacity>
          {canOpenMap || canSendReviewLink ? (
            <View style={styles.footerActions}>{secondaryActions}</View>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}
