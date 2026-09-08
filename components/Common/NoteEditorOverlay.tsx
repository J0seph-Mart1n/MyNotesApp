import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, BackHandler, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/ThemeContext';

type NoteEditorOverlayProps = {
  selectedNote: { id: string; title: string; content: string } | null;
  editTitle: string;
  setEditTitle: (title: string) => void;
  editContent: string;
  setEditContent: (content: string) => void;
  onClose: () => void;
  contentPlaceholder?: string;
};

export default function NoteEditorOverlay({
  selectedNote,
  editTitle,
  setEditTitle,
  editContent,
  setEditContent,
  onClose,
  contentPlaceholder = 'Note',
}: NoteEditorOverlayProps) {
  const { colors } = useTheme();
  const openAnimation = useRef(new Animated.Value(0)).current;
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (selectedNote) {
      openAnimation.setValue(0);
      Animated.spring(openAnimation, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 60,
      }).start();
    }
  }, [selectedNote, openAnimation]);

  // Intercept Android hardware back button
  useEffect(() => {
    if (!selectedNote) return;

    const backAction = () => {
      handleClose();
      return true; // Prevent default (app exit)
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => subscription.remove();
  }, [selectedNote]);

  const handleClose = () => {
    Animated.timing(openAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        onCloseRef.current();
      }
    });
  };

  if (!selectedNote) return null;

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        styles.editorOverlay,
        {
          backgroundColor: colors.background,
          opacity: openAnimation,
          transform: [
            {
              scale: openAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.7, 1],
              }),
            },
          ],
        },
      ]}
    >
      <SafeAreaView style={styles.editorSafeArea}>
        <View style={styles.editorHeader}>
          <TouchableOpacity onPress={handleClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.editorBody}
        >
          <TextInput
            style={[styles.editorTitleInput, { color: colors.text }]}
            value={editTitle}
            onChangeText={setEditTitle}
            placeholder="Title"
            placeholderTextColor={colors.placeholder || '#808080'}
            multiline
          />
          <TextInput
            style={[styles.editorContentInput, { color: colors.text }]}
            value={editContent}
            onChangeText={setEditContent}
            placeholder={contentPlaceholder}
            placeholderTextColor={colors.placeholder || '#808080'}
            multiline
            scrollEnabled
            textAlignVertical="top"
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  editorOverlay: {
    zIndex: 100,
  },
  editorSafeArea: {
    flex: 1,
  },
  editorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    paddingLeft: 8,
    marginLeft: -8,
  },
  editorBody: {
    flex: 1,
    paddingHorizontal: 20,
  },
  editorTitleInput: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 16,
  },
  editorContentInput: {
    fontSize: 18,
    lineHeight: 28,
    flex: 1,
  },
});