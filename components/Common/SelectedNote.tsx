import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface SelectedNoteProps {
    selectedNoteIds: string[];
    colors: any;
    handleDeleteSelected: () => void;
    setSelectedNoteIds: (ids: string[]) => void;
    handlePinSelected: () => void;
    isPinAction: boolean;
}

export default function SelectedNote({ selectedNoteIds, colors, handleDeleteSelected, setSelectedNoteIds, handlePinSelected, isPinAction }: SelectedNoteProps) {
    return (
        <View style={[styles.header, { justifyContent: 'space-between' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => setSelectedNoteIds([])} style={styles.menuIcon}>
                    <Ionicons name="close" size={32} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.appTitle, { color: colors.text, fontSize: 24 }]}>
                    {selectedNoteIds.length} Selected
                </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={handlePinSelected} style={{ marginRight: 24 }}>
                    <MaterialCommunityIcons name={isPinAction ? "pin" : "pin-off-outline"} size={26} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDeleteSelected}>
                    <Ionicons name="trash" size={26} color="#ff6b6b" />
                </TouchableOpacity>
            </View>
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
        color: '#ffffff',
    },
})