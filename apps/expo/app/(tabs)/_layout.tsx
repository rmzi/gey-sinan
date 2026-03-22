import React from 'react';
import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'book', android: 'book', web: 'book' }}
              tintColor={color}
              size={28}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Practice',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' }}
              tintColor={color}
              size={28}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'gear', android: 'settings', web: 'settings' }}
              tintColor={color}
              size={28}
            />
          ),
        }}
      />
    </Tabs>
  );
}
