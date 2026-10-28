import { BookingStatus } from '@/features/bookings/types';

export const bookingStatusLabels: Record<BookingStatus, string> = {
  tentative: 'În așteptarea avansului',
  confirmed: 'Confirmată',
  completed: 'Finalizată',
  cancelled: 'Anulată',
  expired: 'Expirată',
};
export const staffRoleOptions = [
  { id: 'hall_manager', name: 'Șef de sală' },
  { id: 'waiter', name: 'Ospătar' },
  { id: 'cook', name: 'Bucătar' },
  { id: 'bartender', name: 'Barman' },
  { id: 'other', name: 'Alt rol' },
];

export const bookingPaymentCategories = {
  incoming: [
    { id: 'advance', name: 'Avans' },
    { id: 'partial', name: 'Tranșă' },
    { id: 'full', name: 'Plată finală' },
    { id: 'other', name: 'Altă încasare' },
  ],
  outgoing: [
    { id: 'staff', name: 'Personal' },
    { id: 'suppliers', name: 'Furnizori' },
    { id: 'refund', name: 'Restituire client' },
    { id: 'other', name: 'Altă cheltuială' },
  ],
};
