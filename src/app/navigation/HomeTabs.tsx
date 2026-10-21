import React, { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useAuth } from '@/features/auth/AuthProvider';
import { AgendaScreen } from '@/features/company/screens/AgendaScreen';
import { CalendarScreen } from '@/features/bookings/screens/CalendarScreen';
import { BookingsScreen } from '@/features/bookings/screens/BookingsScreen';
import { CustomersScreen } from '@/features/company/screens/CustomersScreen';
import { MoreScreen } from '@/features/company/screens/MoreScreen';
import { HomeTabParamList } from '@/shared/navigation/types';
import { theme } from '@/shared/theme/theme';
import { TabBarLabel } from '@/app/navigation/TabBarLabel';

const Tab = createBottomTabNavigator<HomeTabParamList>();
const TAB_CONTENT_HEIGHT = 56;

export default function HomeTabs() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  const [labelHeights, setLabelHeights] = useState<Record<string, number>>({});
  const labelHeight = Math.max(
    theme.spacing.lg * fontScale,
    ...Object.values(labelHeights),
  );
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.menu.primary,
        tabBarActiveBackgroundColor: theme.colors.menu.selected,
        tabBarInactiveTintColor: theme.colors.menu.muted,
        tabBarHideOnKeyboard: true,
        tabBarAllowFontScaling: true,
        tabBarLabelPosition: 'below-icon',
        tabBarLabel: ({ color, children }) => (
          <TabBarLabel
            label={children}
            color={color}
            onHeightChange={height => {
              setLabelHeights(previous =>
                previous[route.name] === height
                  ? previous
                  : { ...previous, [route.name]: height },
              );
            }}
          />
        ),
        tabBarItemStyle: { borderRadius: theme.radius.lg, overflow: 'hidden' },
        tabBarStyle: {
          backgroundColor: theme.colors.menu.surface,
          borderTopWidth: 0,
          borderTopLeftRadius: theme.radius.lg,
          borderTopRightRadius: theme.radius.lg,
          height:
            TAB_CONTENT_HEIGHT +
            Math.max(0, labelHeight - theme.spacing.lg) +
            insets.bottom,
          paddingTop: theme.spacing.xs,
          paddingBottom: insets.bottom,
        },
      })}
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
