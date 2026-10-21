import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from 'react-native-paper';
import dayjs from 'dayjs';
import { useCalendar } from '@/features/bookings/hooks/useBookings';
import { CalendarMonth } from '@/features/bookings/components/CalendarMonth';
import { CalendarDayHalls } from '@/features/bookings/components/CalendarDayHalls';
import { BookingForm } from '@/features/bookings/components/BookingForm';
import { QueryNotice } from '@/features/bookings/components/QueryNotice';
import { plannerStyles as styles } from '@/features/bookings/components/plannerStyles';
import { Screen } from '@/shared/components/Screen';
import { AppButton } from '@/shared/components/AppButton';
import { SearchableSelect } from '@/shared/components/ControlledSelectField';
import {
  companyNow,
  formatLongDate,
  formatMonthLabel,
} from '@/shared/utils/formatDate';
import { IconButton } from '@/shared/components/IconButton';

const MONTHS_PER_YEAR = 12;
export function CalendarScreen() {
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
  const movePeriod = (direction: number) => {
    const next = dayjs(visible).add(direction, period);
    setVisible(next.startOf('month').format('YYYY-MM-DD'));
    setSelected(dayjs(selected).add(direction, period).format('YYYY-MM-DD'));
  };
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
        <Text style={styles.muted}>
          Alege o zi pentru a vedea sălile libere și rezervările.
        </Text>
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
        </View>
        <View style={styles.between}>
          <IconButton
            accessibilityLabel="Perioada anterioară"
            icon="chevron-back"
            onPress={() => movePeriod(-1)}
          />
          <Text style={[styles.subtitle, styles.grow]}>
            {period === 'year'
              ? dayjs(visible).format('YYYY')
              : formatMonthLabel(visible.slice(0, 7))}
          </Text>
          <IconButton
            accessibilityLabel="Perioada următoare"
            icon="chevron-forward"
            onPress={() => movePeriod(1)}
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
            onSelect={date => {
              setSelected(date);
              setVisible(dayjs(date).startOf('month').format('YYYY-MM-DD'));
            }}
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
        <CalendarDayHalls
          date={selected}
          hallId={hallId || undefined}
          onReserve={id => {
            setNewHallId(id);
            setCreating(true);
          }}
        />
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
