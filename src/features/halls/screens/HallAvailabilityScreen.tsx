import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CalendarScreen } from '@/features/bookings/screens/CalendarScreen';
import { RootStackParamList } from '@/shared/navigation/types';

export function HallAvailabilityScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'HallAvailability'>) {
  return (
    <CalendarScreen
      initialHallId={route.params.hallId}
      onBack={() => navigation.goBack()}
    />
  );
}
