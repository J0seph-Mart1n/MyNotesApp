import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/hooks/ThemeContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { initDB } from '@/util/database';
import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { theme, toggleTheme, colors } = useTheme();

  useEffect(() => {
    initDB()
      .then(() => console.log('Database initialized'))
      .catch(err => console.error('Database failed', err));
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.subText,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={30} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="secrets"
        options={{
          title: 'Secrets',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="lock.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
