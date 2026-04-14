import { useTheme } from '@/hooks/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type TaskItem = {
    id: string;
    text: string;
    isCompleted: boolean;
};

type ListNoteOverlayProps = {
    isOpen: boolean; // Controls whether this overlay is visible
    listTitle: string;
    setListTitle: (title: string) => void;
    tasks: TaskItem[];
    setTasks: (tasks: TaskItem[]) => void;
    onClose: () => void;
};

export default function ListNoteOverlay({
    isOpen,
    listTitle,
    setListTitle,
    tasks,
    setTasks,
    onClose,
}: ListNoteOverlayProps) {
    const openAnimation = useRef(new Animated.Value(0)).current;
    const { colors } = useTheme();

    // Animation to popup the screen smoothly
    useEffect(() => {
        if (isOpen) {
            Animated.spring(openAnimation, {
                toValue: 1,
                useNativeDriver: true,
                friction: 8,
                tension: 60,
            }).start();
        }
    }, [isOpen]);

    const handleClose = () => {
        Animated.timing(openAnimation, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished) onClose();
        });
    };

    // --- Task Operations ---
    const toggleTask = (id: string) => {
        setTasks(tasks.map((task) =>
            task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
        ));
    };

    const updateTaskText = (id: string, text: string) => {
        setTasks(tasks.map((task) =>
            task.id === id ? { ...task, text } : task
        ));
    };

    const addTask = () => {
        const newTask: TaskItem = { id: Date.now().toString(), text: '', isCompleted: false };
        setTasks([...tasks, newTask]);
    };

    const removeTask = (id: string) => {
        setTasks(tasks.filter((task) => task.id !== id));
    };

    // --- Render Individual Task Row ---
    const renderTask = ({ item }: { item: TaskItem }) => (
        <View style={styles.taskRow}>
            {/* Checkbox Icon */}
            <TouchableOpacity onPress={() => toggleTask(item.id)} style={styles.checkbox}>
                <Ionicons
                    name={item.isCompleted ? "checkbox" : "square-outline"}
                    size={24}
                    color={item.isCompleted ? "#2b8a3e" : colors.text}
                />
            </TouchableOpacity>

            {/* Task Text Input */}
            <TextInput
                style={[
                    styles.taskInput,
                    { color: colors.text },
                    item.isCompleted && styles.completedTaskText // Strkethrough if done!
                ]}
                value={item.text}
                onChangeText={(text) => updateTaskText(item.id, text)}
                placeholder="List item"
                placeholderTextColor="#808080"
            />

            {/* Delete Task Button */}
            <TouchableOpacity onPress={() => removeTask(item.id)} style={styles.deleteButton}>
                <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
        </View>
    );

    if (!isOpen) return null;

    return (
        <Animated.View
            style={[
                StyleSheet.absoluteFill,
                styles.editorOverlay,
                {
                    opacity: openAnimation,
                    transform: [
                        { scale: openAnimation.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
                    ],
                },
            ]}
        >
            <SafeAreaView style={styles.editorSafeArea}>
                {/* Header */}
                <View style={styles.editorHeader}>
                    <TouchableOpacity onPress={handleClose} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color="#ffffff" />
                    </TouchableOpacity>
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.editorBody}>
                    {/* Title Input */}
                    <TextInput
                        style={styles.editorTitleInput}
                        value={listTitle}
                        onChangeText={setListTitle}
                        placeholder="Title"
                        placeholderTextColor="#808080"
                    />

                    {/* List of Tasks */}
                    <FlatList
                        data={tasks}
                        keyExtractor={(item) => item.id}
                        renderItem={renderTask}
                        contentContainerStyle={styles.taskList}
                        ListFooterComponent={
                            <TouchableOpacity style={styles.addTaskButton} onPress={addTask}>
                                <Ionicons name="add" size={24} color={colors.text} />
                                <Text style={[styles.addTaskText, { color: colors.text }]}>List Item</Text>
                            </TouchableOpacity>
                        }
                    />
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    editorOverlay: {
        backgroundColor: '#121212',
        zIndex: 100, // Brings it to front over menus
    },
    editorSafeArea: { flex: 1 },
    editorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginLeft: 16,
    },
    backButton: { paddingLeft: 8, marginLeft: -8 },
    editorBody: { flex: 1, paddingHorizontal: 20 },
    editorTitleInput: {
        fontSize: 28,
        color: '#ffffff',
        fontWeight: '600',
        marginBottom: 24,
    },
    taskList: { paddingBottom: 20 },
    taskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    checkbox: { marginRight: 12 },
    taskInput: {
        flex: 1,
        fontSize: 18,
        paddingVertical: 4,
    },
    completedTaskText: {
        textDecorationLine: 'line-through',
        color: '#808080',
    },
    deleteButton: { padding: 4, marginLeft: 8 },
    addTaskButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#2c2c2c',
        marginTop: 8,
    },
    addTaskText: {
        fontSize: 18,
        marginLeft: 12,
        fontWeight: '500',
    },
});