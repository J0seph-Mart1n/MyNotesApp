import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/ThemeContext';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

export default function CustomDrawer(props: any) {
  const { theme, toggleTheme, colors } = useTheme();

  const animatedBackground = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(colors.card, { duration: 350 }),
    };
  }, [colors.card]);

  return (
    <Animated.View style={[{ flex: 1 }, animatedBackground]}>
      <DrawerContentScrollView {...props} style={{ backgroundColor: 'transparent' }}>
        <View style={[styles.headerContainer, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerText, { color: colors.text }]}>My Notes</Text>
        </View>
        <View style={styles.listContainer}>
          <DrawerItemList {...props} />
        </View>
        <View style={[styles.themeToggleContainer, { borderTopColor: colors.border }]}>
          <View style={styles.themeToggleRow}>
              <MaterialIcons name={theme === 'dark' ? 'dark-mode' : 'light-mode'} size={24} color={colors.text} />
              <Text style={[styles.themeToggleText, { color: colors.text }]}>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</Text>
          </View>
          <Switch 
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.green }}
              thumbColor={'#ffffff'}
          />
        </View>
      </DrawerContentScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 30, // Adds space above for the safe area
    paddingHorizontal: 24,
    paddingBottom: 24,
    marginBottom: 8,
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 8,
    flex: 1,
  },
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    marginTop: 16,
  },
  themeToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeToggleText: {
    fontSize: 16,
    fontWeight: '600',
  }
});
