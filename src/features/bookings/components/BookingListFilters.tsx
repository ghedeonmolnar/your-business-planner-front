import React from 'react';
import { View } from 'react-native';
import { FormInput } from '@/shared/components/FormInput';
import { useBookingFilters } from '@/features/bookings/hooks/useBookingFilters';
import { bookingStatusLabels } from '@/features/bookings/utils/bookingLabels';
import { bookingListStyles as styles } from '@/features/bookings/components/bookingListStyles';
import { DirectoryItem } from '@/features/company/types';
import { AppButton } from '@/shared/components/AppButton';
import { AppSegmentedControl } from '@/shared/components/AppSegmentedControl';
import {
  SearchableSelect,
  SelectOptionsState,
} from '@/shared/components/ControlledSelectField';
import { SearchField } from '@/shared/components/SearchField';
import { useSingleColumnLayout } from '@/shared/hooks/useSingleColumnLayout';
import { BookingSort, BookingTimeframe } from '@/features/bookings/types';

const TIMEFRAMES: BookingTimeframe[] = ['all', 'upcoming', 'past'];

export function BookingListFilters({
  filters,
  halls,
  manager,
  hallsState,
}: {
  filters: ReturnType<typeof useBookingFilters>;
  halls: DirectoryItem[];
  manager: boolean;
  hallsState: SelectOptionsState;
}) {
  const singleColumn = useSingleColumnLayout();
  return (
    <View style={styles.section}>
      {filters.searchOpen ? (
        <SearchField
          autoFocus
          label="Caută rezervări"
          placeholder={
            manager ? 'Nume, telefon sau observații' : 'Numele clientului'
          }
          value={filters.search}
          onChange={filters.setSearch}
        />
      ) : null}
      <AppSegmentedControl
        segments={[
          { label: 'Toate' },
          { label: 'Viitoare' },
          { label: 'Trecute' },
        ]}
        selectedIndex={TIMEFRAMES.indexOf(filters.timeframe)}
        onChangeIndex={index => filters.setTimeframe(TIMEFRAMES[index])}
      />
      <View style={[styles.row, singleColumn && styles.column]}>
        <FormInput
          label="Stare"
          style={[styles.filterField, !singleColumn && styles.grow]}
        >
          <SearchableSelect
            label="Starea rezervării"
            multiline
            single
            allowClear
            selectedValues={filters.status ? [filters.status] : []}
            options={Object.entries(bookingStatusLabels).map(([id, name]) => ({
              id,
              name,
            }))}
            onChange={values => filters.setStatus(values[0] ?? '')}
            placeholder="Toate stările"
            searchPlaceholder="Caută stare"
            noItemsText="Nu există stări"
          />
        </FormInput>
        {manager ? (
          <FormInput
            label="Sală"
            style={[styles.filterField, !singleColumn && styles.grow]}
          >
            <SearchableSelect
              label="Sală de evenimente"
              optionsState={hallsState}
              multiline
              single
              allowClear
              selectedValues={filters.hallId ? [filters.hallId] : []}
              options={halls.map(hall => ({
                id: hall.id,
                name:
                  hall.name + (hall.is_active === false ? ' · Arhivată' : ''),
              }))}
              onChange={values => filters.setHallId(values[0] ?? '')}
              placeholder={
                hallsState.loading && !halls.length
                  ? 'Se încarcă sălile…'
                  : 'Toate sălile'
              }
              searchPlaceholder="Caută sala"
              noItemsText="Nu există săli"
            />
          </FormInput>
        ) : null}
      </View>
      <View style={[styles.row, singleColumn && styles.column]}>
        {manager ? (
          <FormInput
            label="Filtre"
            style={[styles.filterField, !singleColumn && styles.grow]}
          >
            <AppButton
              label={`Avansate${filters.advancedCount ? ` · ${filters.advancedCount}` : ''}`}
              accessibilityLabel="Filtre avansate"
              icon="filter-outline"
              variant="soft"
              multiline
              onPress={filters.openAdvanced}
            />
          </FormInput>
        ) : null}
        <FormInput
          label="Ordine după dată"
          style={[styles.filterField, !singleColumn && styles.grow]}
        >
          <SearchableSelect<BookingSort>
            label="Sortează rezervările"
            multiline
            single
            allowClear={false}
            selectedValues={[filters.sort]}
            options={[
              {
                id: 'date_asc',
                name: 'Crescător',
                description: 'De la prima dată la ultima dată a evenimentului.',
              },
              {
                id: 'date_desc',
                name: 'Descrescător',
                description: 'De la ultima dată la prima dată a evenimentului.',
              },
            ]}
            onChange={values => filters.setSort(values[0] ?? 'date_asc')}
            placeholder="Sortează după"
            searchPlaceholder="Caută sortare"
            noItemsText="Nu există opțiuni"
          />
        </FormInput>
      </View>
    </View>
  );
}
