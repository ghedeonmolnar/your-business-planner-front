import React from 'react';
import { Text } from 'react-native-paper';
import { Booking } from '@/features/bookings/types';
import { BookingDetailsSection } from '@/features/bookings/components/BookingDetailsSection';
import { BookingDetailField } from '@/features/bookings/components/BookingDetailField';
import { bookingDetailsStyles as styles } from '@/features/bookings/components/bookingDetailsStyles';
import { staffRoleOptions } from '@/features/bookings/utils/bookingLabels';
import { Card } from '@/shared/components/Card';
import { formatCompanyDateTime } from '@/shared/utils/formatDate';
import { formatExactMoney } from '@/shared/utils/money';

export function BookingStaffSection({
  booking,
  showCost,
}: {
  booking: Booking;
  showCost: boolean;
}) {
  const count = booking.staff.length;
  const summary = `${count} ${count === 1 ? 'persoană alocată' : 'persoane alocate'}${showCost && booking.employee_cost !== undefined ? ` · cost estimat ${formatExactMoney(booking.employee_cost)}` : ''}`;
  return (
    <BookingDetailsSection
      title="Personal și organizare"
      icon="people-outline"
      summary={summary}
    >
      {!count ? (
        <Text style={styles.body}>
          Nu există personal alocat. Alocarea este opțională.
        </Text>
      ) : null}
      {booking.staff.map(person => (
        <Card key={person.employee_id}>
          <Text style={styles.sectionTitle}>
            {person.employee_name || 'Persoană alocată'}
          </Text>
          <Text style={styles.subtitle}>
            {staffRoleOptions.find(role => role.id === person.job_role)?.name ??
              person.job_role}
          </Text>
          <BookingDetailField
            label="Început"
            value={formatCompanyDateTime(person.starts_at)}
          />
          <BookingDetailField
            label="Sfârșit"
            value={formatCompanyDateTime(person.ends_at)}
          />
          {showCost && person.estimated_cost !== undefined ? (
            <BookingDetailField
              label="Remunerație estimată"
              value={formatExactMoney(person.estimated_cost)}
            />
          ) : null}
        </Card>
      ))}
    </BookingDetailsSection>
  );
}
