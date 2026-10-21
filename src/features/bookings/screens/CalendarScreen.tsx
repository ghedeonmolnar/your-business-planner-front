import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Card } from '@/shared/components/Card';
import dayjs from 'dayjs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useHallDay, useCalendar } from '@/features/bookings/hooks/useBookings';
import { CalendarMonth } from '@/features/bookings/components/CalendarMonth';
import { bookingStatusLabels } from '@/features/bookings/utils/bookingLabels';
import { BookingForm } from '@/features/bookings/components/BookingForm';
import { QueryNotice } from '@/features/bookings/components/QueryNotice';
import { plannerStyles as styles } from '@/features/bookings/components/plannerStyles';
import { Screen } from '@/shared/components/Screen';
import { AppButton } from '@/shared/components/AppButton';
import { SearchableSelect } from '@/shared/components/ControlledSelectField';
import { RootStackParamList } from '@/shared/navigation/types';
import { companyNow, formatLongDate } from '@/shared/utils/formatDate';

const MONTHS_PER_YEAR = 12;
export function CalendarScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [period, setPeriod] = useState<'month' | 'year'>('month');
  const [visible, setVisible] = useState(
    companyNow().startOf('month').format('YYYY-MM-DD'),
  );
  const [selected, setSelected] = useState(companyNow().format('YYYY-MM-DD'));
  const [hallId, setHallId] = useState('');
  const [creating, setCreating] = useState(false);
  const [newHallId, setNewHallId] = useState('');
  const from = dayjs(visible).startOf(period).format('YYYY-MM-DD');
  const to = dayjs(visible).endOf(period).format('YYYY-MM-DD');
  const calendar = useCalendar({
    date_from: from,
    date_to: to,
    hall_id: hallId || undefined,
  });
  const day = useHallDay(selected);
  const halls = (day.data?.pages.flatMap(page => page.items) ?? []).filter(
    hall => !hallId || hall.id === hallId,
  );
  const months =
    period === 'month'
      ? [visible.slice(0, 7)]
      : Array.from({ length: MONTHS_PER_YEAR }, (_, index) =>
          dayjs(visible).startOf('year').add(index, 'month').format('YYYY-MM'),
        );
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Calendar săli</Text>
        <View style={styles.row}>
          <AppButton
            label="Lunar"
            variant={period === 'month' ? 'primary' : 'outline'}
            onPress={() => setPeriod('month')}
          />
          <AppButton
            label="Anual"
            variant={period === 'year' ? 'primary' : 'outline'}
            onPress={() => setPeriod('year')}
          />
          <AppButton
            accessibilityLabel="Perioada anterioară"
            icon="chevron-back"
            onPress={() =>
              setVisible(
                dayjs(visible).subtract(1, period).format('YYYY-MM-DD'),
              )
            }
          />
          <AppButton
            accessibilityLabel="Perioada următoare"
            icon="chevron-forward"
            onPress={() =>
              setVisible(dayjs(visible).add(1, period).format('YYYY-MM-DD'))
            }
          />
        </View>
        <SearchableSelect
          label="Sală"
          allowClear
          single
          options={
            calendar.data?.halls.map(hall => ({
              id: hall.id,
              name: hall.name + (hall.is_active ? '' : ' · Arhivată'),
            })) ?? []
          }
          selectedValues={hallId ? [hallId] : []}
          onChange={values => setHallId(values[0] ?? '')}
          placeholder="Toate sălile"
          searchPlaceholder="Caută sala"
          noItemsText="Adaugă prima sală din Mai multe → Săli."
        />
        <QueryNotice
          loading={calendar.isLoading}
          error={calendar.error}
          retry={() => calendar.refetch()}
        />
        <Text style={styles.muted}>
          Numărul de sub dată indică sălile libere.
        </Text>
        {months.map(month => (
          <CalendarMonth
            key={month}
            month={month}
            days={calendar.data?.days ?? []}
            selected={selected}
            onSelect={setSelected}
          />
        ))}
        <Text style={styles.subtitle}>{formatLongDate(selected)}</Text>
        <Text style={styles.text}>
          Săli libere:{' '}
          {calendar.data?.days.find(item => item.date === selected)?.free ??
            '—'}
        </Text>
        <AppButton
          label="Rezervare nouă în această zi"
          onPress={() => {
            setNewHallId('');
            setCreating(true);
          }}
        />
        <QueryNotice
          loading={day.isLoading}
          error={day.error}
          empty={!halls.length}
          retry={() => day.refetch()}
        />
        {halls.map(hall => (
          <Card key={hall.id} style={styles.card}>
            <Text style={styles.subtitle}>{hall.name}</Text>
            <Text style={styles.text}>
              {hall.capacity} persoane ·{' '}
              {hall.status === 'free'
                ? 'Liberă'
                : bookingStatusLabels[hall.status]}
            </Text>
            <AppButton
              label={hall.booking_id ? 'Deschide rezervarea' : 'Rezervă sala'}
              onPress={() => {
                if (hall.booking_id) {
                  navigation.navigate('EventDetails', {
                    eventId: hall.booking_id,
                  });
                } else {
                  setNewHallId(hall.id);
                  setCreating(true);
                }
              }}
            />
          </Card>
        ))}
        {day.hasNextPage ? (
          <AppButton
            label="Mai multe rezervări"
            disabled={day.isFetchingNextPage}
            onPress={() => day.fetchNextPage()}
          />
        ) : null}
      </ScrollView>
      {creating ? (
        <BookingForm
          date={selected}
          hallId={
            newHallId ||
            (calendar.data?.halls.find(hall => hall.id === hallId)?.is_active
              ? hallId
              : undefined)
          }
          onClose={() => {
            setCreating(false);
            setNewHallId('');
          }}
        />
      ) : null}
    </Screen>
  );
}
