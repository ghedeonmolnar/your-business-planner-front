import React, { useState } from 'react';
import dayjs from 'dayjs';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { SearchableSelect } from '@/shared/components/ControlledSelectField';
import { AppButton } from '@/shared/components/AppButton';
import { formatMonthName } from '@/shared/utils/formatDate';

const YEARS_ON_EACH_SIDE = 50;
const MONTHS_PER_YEAR = 12;

export function CalendarPeriodPicker({
  selected,
  onSelect,
  onClose,
}: {
  selected: string;
  onSelect: (month: string) => void;
  onClose: () => void;
}) {
  const [year, setYear] = useState(dayjs(selected).year());
  const [month, setMonth] = useState(selected.slice(5, 7));
  const years = Array.from(
    { length: YEARS_ON_EACH_SIDE * 2 + 1 },
    (_, index) => year - YEARS_ON_EACH_SIDE + index,
  ).filter(value => value >= 1 && value <= 9999);
  return (
    <FormModalFrame
      visible
      title="Alege luna și anul"
      onClose={onClose}
      fitContent
      footer={
        <AppButton
          label="Afișează perioada"
          onPress={() => {
            onSelect(`${year}-${month}`);
            onClose();
          }}
        />
      }
    >
      <SearchableSelect
        testID="calendar-period-year"
        label="An"
        allowClear={false}
        single
        selectedValues={[year]}
        options={years.map(value => ({ id: value, name: String(value) }))}
        onChange={values => {
          if (values[0] !== undefined) setYear(values[0]);
        }}
        placeholder="Alege anul"
        searchPlaceholder="Caută anul"
        noItemsText="Anul nu este în intervalul afișat."
      />
      <SearchableSelect
        testID="calendar-period-month"
        label="Lună"
        allowClear={false}
        single
        selectedValues={[month]}
        options={Array.from({ length: MONTHS_PER_YEAR }, (_, index) => {
          const value = String(index + 1).padStart(2, '0');
          return { id: value, name: formatMonthName(`${year}-${value}`) };
        })}
        onChange={values => {
          if (values[0]) setMonth(values[0]);
        }}
        placeholder="Alege luna"
        searchPlaceholder="Caută luna"
        noItemsText="Nu există luni pentru căutarea introdusă."
      />
    </FormModalFrame>
  );
}
