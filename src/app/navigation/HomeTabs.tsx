import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useAuth } from '@/features/auth/AuthProvider';
import { AgendaScreen } from '@/features/company/screens/AgendaScreen';
import { CalendarScreen } from '@/features/bookings/screens/CalendarScreen';
import { BookingsScreen } from '@/features/bookings/screens/BookingsScreen';
import { CustomersScreen } from '@/features/company/screens/DirectoryScreen';
import { MoreScreen } from '@/features/company/screens/MoreScreen';
import { HomeTabParamList } from '@/shared/navigation/types';
import { theme } from '@/shared/theme/theme';

const Tab = createBottomTabNavigator<HomeTabParamList>();
export default function HomeTabs() {
  const { user } = useAuth();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarHideOnKeyboard: true,
        tabBarAllowFontScaling: true,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={AgendaScreen}
        options={{
          title: 'Agendă',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      {user?.role !== 'employee' ? (
        <Tab.Screen
          name="Calendar"
          component={CalendarScreen}
          options={{
            title: 'Calendar',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar-outline" color={color} size={size} />
            ),
          }}
        />
      ) : null}
      <Tab.Screen
        name="Events"
        component={BookingsScreen}
        options={{
          title: 'Rezervări',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" color={color} size={size} />
          ),
        }}
      />
      {user?.role !== 'employee' ? (
        <Tab.Screen
          name="Clients"
          component={CustomersScreen}
          options={{
            title: 'Clienți',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" color={color} size={size} />
            ),
          }}
        />
      ) : null}
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          title: 'Mai multe',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
