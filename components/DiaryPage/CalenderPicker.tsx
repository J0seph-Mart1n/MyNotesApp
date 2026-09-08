import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Calendar } from 'react-native-calendars';
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from '@/hooks/ThemeContext';

interface CalenderPickerProps {
    date: Date;
    onChange: (selectedDate: Date) => void;
}

export default function CalenderPicker({ date, onChange }: CalenderPickerProps) {
    const { colors, theme } = useTheme();
    const [pickerVisible, setPickerVisible] = useState(false);
    const [tempYear, setTempYear] = useState(date.getFullYear());

    const onDayPress = (day: any) => {
        const [year, month, d] = day.dateString.split('-').map(Number);
        const finalDate = new Date(year, month - 1, d);
        onChange(finalDate);
    };

    const onMonthChange = (monthData: any) => {
        const [year, month, d] = monthData.dateString.split('-').map(Number);
        const finalDate = new Date(year, month - 1, d);
        onChange(finalDate);
    };

    const handleMonthSelect = (mIndex: number) => {
        const currentDay = date.getDate();
        const maxDays = new Date(tempYear, mIndex + 1, 0).getDate();
        const safeDay = Math.min(currentDay, maxDays);
        const newDate = new Date(tempYear, mIndex, safeDay);
        onChange(newDate);
        setPickerVisible(false);
    };

    // Format local date manually to avoid UTC shift bug
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${d}`;
    const monthYearKey = `${year}-${month}`;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
        <View style={styles.section}>
            <View style={styles.calendarHeader}>
                <View>
                    <Text style={[styles.timelineLabel, { color: colors.subText }]}>TIMELINE</Text>
                    <Text style={[styles.monthTitle, { color: colors.text }]}>
                        {date.toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}
                    </Text>
                </View>
            </View>

            <View style={[styles.calendarContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Calendar
                    key={`${monthYearKey}-${theme}`}
                    current={dateString}
                    onDayPress={onDayPress}
                    onMonthChange={onMonthChange}
                    renderArrow={(direction: 'left' | 'right') => (
                        <MaterialIcons 
                            name={direction === 'left' ? 'chevron-left' : 'chevron-right'} 
                            size={24} 
                            color={colors.green} 
                        />
                    )}
                    renderHeader={(calendarDate: any) => {
                        let headerDate: Date;
                        if (calendarDate.getTime) {
                            headerDate = new Date(calendarDate.getTime());
                        } else if (calendarDate.timestamp) {
                            headerDate = new Date(calendarDate.timestamp);
                        } else {
                            headerDate = new Date(calendarDate);
                        }
                        
                        return (
                            <TouchableOpacity 
                                style={styles.calendarMonthHeaderButton}
                                onPress={() => { setTempYear(headerDate.getFullYear()); setPickerVisible(true); }}
                            >
                                <Text style={[styles.calendarMonthHeaderText, { color: colors.text }]}>
                                    {headerDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                </Text>
                                <MaterialIcons name="arrow-drop-down" size={20} color={colors.text} />
                            </TouchableOpacity>
                        );
                    }}
                    markedDates={{
                        [dateString]: { selected: true, selectedColor: colors.green, selectedTextColor: '#ffffff' }
                    }}
                    theme={{
                        backgroundColor: 'transparent',
                        calendarBackground: 'transparent',
                        textSectionTitleColor: colors.subText,
                        selectedDayBackgroundColor: colors.green,
                        selectedDayTextColor: '#ffffff',
                        todayTextColor: colors.green,
                        dayTextColor: colors.text,
                        textDisabledColor: colors.border,
                        arrowColor: colors.green,
                        monthTextColor: colors.text,
                        textMonthFontWeight: 'bold',
                        textDayFontWeight: '500',
                    }}
                />
            </View>

            <Modal visible={pickerVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.yearSelector}>
                            <TouchableOpacity onPress={() => setTempYear(y => y - 1)} style={styles.yearArrow}>
                                <MaterialIcons name="chevron-left" size={32} color={colors.green} />
                            </TouchableOpacity>
                            <Text style={[styles.yearText, { color: colors.text }]}>{tempYear}</Text>
                            <TouchableOpacity onPress={() => setTempYear(y => y + 1)} style={styles.yearArrow}>
                                <MaterialIcons name="chevron-right" size={32} color={colors.green} />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.monthsGrid}>
                            {months.map((m, i) => {
                                const isSelected = date.getMonth() === i && date.getFullYear() === tempYear;
                                return (
                                    <TouchableOpacity 
                                        key={m} 
                                        style={[styles.monthCell, isSelected && { backgroundColor: colors.green }]}
                                        onPress={() => handleMonthSelect(i)}
                                    >
                                        <Text style={[styles.monthCellText, { color: colors.text }, isSelected && { color: '#ffffff', fontWeight: 'bold' }]}>{m}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <TouchableOpacity style={styles.closeModalButton} onPress={() => setPickerVisible(false)}>
                            <Text style={[styles.closeModalText, { color: colors.green }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    section: {
        marginBottom: 32,
    },
    calendarHeader: {
        marginBottom: 16,
    },
    timelineLabel: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    monthTitle: {
        fontSize: 32,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    calendarContainer: {
        borderRadius: 24,
        padding: 8,
        borderWidth: 1,
    },
    calendarMonthHeaderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    calendarMonthHeaderText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        borderWidth: 1,
    },
    yearSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    yearArrow: {
        padding: 8,
    },
    yearText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    monthsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    monthCell: {
        width: '30%',
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: 'transparent',
    },
    monthCellText: {
        fontSize: 16,
        fontWeight: '500',
    },
    closeModalButton: {
        marginTop: 32,
        alignItems: 'center',
        paddingVertical: 12,
    },
    closeModalText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
})