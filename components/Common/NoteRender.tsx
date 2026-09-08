import React from 'react';
import { Note } from "@/functions/NoteHandles";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface NoteRenderProps {
    item: Note;
    isSelected: boolean;
    colors: any;
    handleOpenNote: (note: Note) => void;
    toggleSelection: (id: string) => void;
    previewContent: string;
}

export default function NoteRender({ item, isSelected, colors, handleOpenNote, toggleSelection, previewContent }: NoteRenderProps) {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            style={[
                styles.noteTile,
                { backgroundColor: colors.card, borderColor: colors.border },
                isSelected && { borderColor: colors.green, borderWidth: 2, backgroundColor: colors.card }
            ]}
            onPress={() => handleOpenNote(item)}
            onLongPress={() => toggleSelection(item.id)}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Text style={[styles.noteTitle, { flex: 1, color: colors.text }]} numberOfLines={1}>
                    {item.title}
                </Text>
                {item.isPinned && <MaterialCommunityIcons name="pin" size={16} color={colors.text} style={{ marginLeft: 8 }} />}
            </View>
            <Text style={[styles.noteContent, { color: colors.subText }]} numberOfLines={6}>
                {previewContent}
            </Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    noteTile: {
        flex: 1,
        marginHorizontal: 6,
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
    },
    noteTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 6,
    },
    noteContent: {
        fontSize: 14,
        lineHeight: 20,
    },
})