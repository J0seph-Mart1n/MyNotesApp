import { useTheme } from '@/hooks/ThemeContext';
import { DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PageHeaderProps {
    title: string;
    navigation: any;
}

export default function PageHeader({ title, navigation }: PageHeaderProps) {
    const { colors } = useTheme();
    return (
        <View style={styles.header}>
            <TouchableOpacity style={styles.menuIcon} onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
                <Ionicons name="menu" size={32} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.appTitle, { color: colors.text }]}>{title}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 16,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '700',
  },
})