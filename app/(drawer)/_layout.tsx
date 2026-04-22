import { IconSymbol } from '@/components/icon-symbol';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '@/hooks/ThemeContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { initDB } from '@/constants/database';
import { Drawer } from 'expo-router/drawer';
import React, { useEffect } from 'react';
import CustomDrawer from '@/components/Common/CustomDrawer';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { theme, toggleTheme, colors } = useTheme();

  useEffect(() => {
    initDB()
      .then(() => console.log('Database initialized'))
      .catch(err => console.error('Database failed', err));
  }, []);

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        drawerStyle: {
          backgroundColor: colors.card,
          width: 280,
        },
        drawerActiveBackgroundColor: colors.green + '20',
        drawerActiveTintColor: colors.green,
        drawerInactiveTintColor: colors.subText,
        drawerItemStyle: {
          borderRadius: 50,
          marginVertical: 4,
        },
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '600',
          marginLeft: -10,
        },
        headerShown: false,
      }}>
      <Drawer.Screen
        name="index"
        options={{
          title: 'Home',
          drawerIcon: ({ color }) => <IconSymbol size={30} name="house.fill" color={color} />,
        }}
      />
      <Drawer.Screen
        name="secrets"
        options={{
          title: 'Secrets',
          drawerIcon: ({ color }) => <IconSymbol size={28} name="lock.fill" color={color} />,
        }}
      />
      <Drawer.Screen
        name="diary"
        options={{
          title: ' Diary',
          drawerIcon: ({ color }) => <MaterialIcons name="library-books" size={26} color={color} />,
        }}
      />
    </Drawer>
  );
}