import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { BookingStaffFields } from '@/features/bookings/components/BookingStaffFields';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { bookingFormDefaults } from '@/features/bookings/utils/bookingFormValues';
import { plannerBooking } from '@/features/bookings/utils/plannerTestFixtures';
import { ControlledSelectField } from '@/shared/components/ControlledSelectField';
import { AppButton } from '@/shared/components/AppButton';
import { DatePickerField } from '@/shared/components/DatePickerField';
import { Text } from 'react-native';
import { useAppForm } from '@/shared/hooks/useAppForm';
import { renderWithProviders } from '@/shared/test/renderWithProviders';

function StaffEditor({ startsAt = '2027-11-13 18:00' }: { startsAt?: string }) {
  const form = useAppForm<BookingFormValues>({
    defaultValues: {
      ...bookingFormDefaults(
        plannerBooking.date,
        plannerBooking.hall_id,
        plannerBooking,
      ),
      staff: [
        {
          employee_id: 'person-a',
          job_role: 'waiter',
          pay_type: 'fixed',
          rate: '425.00',
          starts_at: startsAt,
          ends_at: '2027-11-14 04:00',
        },
      ],
    },
  });
  return (
    <>
      <Text testID="staff-start">{form.watch('staff.0.starts_at')}</Text>
      <BookingStaffFields
        form={form}
        employees={[
          {
            id: 'person-a',
            name: 'Persoana A',
            is_active: true,
            job_role: 'waiter',
            hourly_rate: 40,
          },
          {
            id: 'person-b',
            name: 'Persoana B',
            is_active: true,
            job_role: 'cook',
            hourly_rate: 50,
          },
        ]}
      />
    </>
  );
}

test('păstrează tariful negociat al persoanei existente și precompletează numai la schimbarea persoanei', async () => {
  const { renderer, unmount } = await renderWithProviders(<StaffEditor />);
  const field = () =>
    renderer.root
      .findAllByType(ControlledSelectField)
      .find(item => item.props.name === 'staff.0.employee_id')!;
  const rate = () =>
    renderer.root.findByProps({ accessibilityLabel: 'Sumă / tarif (lei)' })
      .props.value;
  try {
    await ReactTestRenderer.act(async () =>
      field().props.onSelectionChange(['person-a']),
    );
    expect(rate()).toBe('425.00');
    await ReactTestRenderer.act(async () =>
      field().props.onSelectionChange(['person-b']),
    );
    expect(rate()).toBe('50');
    await ReactTestRenderer.act(async () =>
      renderer.root
        .findAllByType(AppButton)
        .find(item => item.props.label === 'Adaugă persoană')!
        .props.onPress(),
    );
    expect(
      renderer.root
        .findAllByProps({ accessibilityLabel: 'Sumă / tarif (lei)' })
        .some(item => item.props.value === ''),
    ).toBe(true);
  } finally {
    await unmount();
  }
});

test('reselectarea zilei păstrează apariția explicită a orei repetate de toamnă', async () => {
  const startsAt = '2026-10-25 03:30 +03:00';
  const { renderer, unmount } = await renderWithProviders(
    <StaffEditor startsAt={startsAt} />,
  );
  try {
    const selectDate = (date: string) =>
      renderer.root.findAllByType(DatePickerField)[0].props.onChange(date);
    await ReactTestRenderer.act(async () => selectDate('2026-10-25'));
    expect(
      renderer.root.findByProps({ testID: 'staff-start' }).props.children,
    ).toBe(startsAt);
    await ReactTestRenderer.act(async () => selectDate('2026-10-26'));
    expect(
      renderer.root.findByProps({ testID: 'staff-start' }).props.children,
    ).toBe('2026-10-26 03:30');
  } finally {
    await unmount();
  }
});
