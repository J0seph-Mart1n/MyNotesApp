import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/hooks/ThemeContext';

type FabMenuProps = {
  onNewNote?: () => void;
  onNewListNote?: () => void;
};

export default function FabMenu({ onNewNote, onNewListNote }: FabMenuProps) {
  const { colors } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current; // Background and FAB rotation
  const b1 = useRef(new Animated.Value(0)).current; // Drawing (top)
  const b2 = useRef(new Animated.Value(0)).current; // List (middle)
  const b3 = useRef(new Animated.Value(0)).current; // Notes (bottom)

  useEffect(() => {
    const toVal = isMenuOpen ? 1 : 0;

    // Animate background overlay & fab rotation immediately
    Animated.spring(animation, {
      toValue: toVal,
      useNativeDriver: true,
      friction: 6,
      tension: 20,
    }).start();

    // Trigger staggered delays for the bubbles
    if (isMenuOpen) {
      // Open: Bottom (b3) pops first, then middle (b2), then top (b1)
      Animated.stagger(60, [
        Animated.spring(b3, { toValue: 1, useNativeDriver: true, friction: 5, tension: 40 }),
        Animated.spring(b2, { toValue: 1, useNativeDriver: true, friction: 5, tension: 40 }),
        Animated.spring(b1, { toValue: 1, useNativeDriver: true, friction: 5, tension: 40 }),
      ]).start();
    } else {
      // Close: Top (b1) closes first, then middle (b2), then bottom (b3)
      Animated.stagger(40, [
        Animated.spring(b1, { toValue: 0, useNativeDriver: true, friction: 6, tension: 20 }),
        Animated.spring(b2, { toValue: 0, useNativeDriver: true, friction: 6, tension: 20 }),
        Animated.spring(b3, { toValue: 0, useNativeDriver: true, friction: 6, tension: 20 }),
      ]).start();
    }
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      {/* Overlay Background */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 10,
            opacity: animation
          }
        ]}
        pointerEvents={isMenuOpen ? 'auto' : 'none'}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsMenuOpen(false)} />
      </Animated.View>

      {/* Separate Option Bubbles */}
      <View style={styles.bubblesContainer} pointerEvents={isMenuOpen ? 'box-none' : 'none'}>
        <Animated.View style={[
          styles.bubbleWrapper,
          {
            opacity: b1,
            transform: [
              { scale: b1.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) }
            ]
          }
        ]}>
          <TouchableOpacity style={[styles.bubbleItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="brush-outline" size={20} color={colors.text} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>Drawing</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[
          styles.bubbleWrapper,
          {
            opacity: b2,
            transform: [
              { scale: b2.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) }
            ]
          }
        ]}>
          <TouchableOpacity
            style={[styles.bubbleItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              toggleMenu();
              if (onNewListNote) onNewListNote();
            }}
          >
            <Ionicons name="list-outline" size={20} color={colors.text} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>List</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[
          styles.bubbleWrapper,
          {
            opacity: b3,
            transform: [
              { scale: b3.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) }
            ]
          }
        ]}>
          <TouchableOpacity
            style={[styles.bubbleItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              toggleMenu();
              if (onNewNote) onNewNote();
            }}
          >
            <Ionicons name="document-text-outline" size={20} color={colors.text} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>Notes</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.green }]}
        activeOpacity={0.8}
        onPress={toggleMenu}
      >
        <Animated.View style={{
          transform: [{
            rotate: animation.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '45deg']
            })
          }]
        }}>
          <Ionicons name="add" size={32} color={'#ffffff'} />
        </Animated.View>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 50,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 20,
  },
  bubblesContainer: {
    position: 'absolute',
    bottom: 110,
    right: 24,
    width: 160,
    alignItems: 'flex-end',
    zIndex: 20,
  },
  bubbleWrapper: {
    marginBottom: 12,
  },
  bubbleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
});