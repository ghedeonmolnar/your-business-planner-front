import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CalendarScreen } from '@/features/bookings/screens/CalendarScreen';
import { RootStackParamList } from '@/shared/navigation/types';

export function AgendaWeekendScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'AgendaWeekend'>) {
  return (
    <CalendarScreen
      initialDate={route.params.date}
      headerTitle="Săli libere în weekend"
      onBack={() => navigation.goBack()}
    />
  );
}
