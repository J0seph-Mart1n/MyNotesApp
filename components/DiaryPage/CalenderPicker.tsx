import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Calendar } from 'react-native-calendars';
import { MaterialIcons } from "@expo/vector-icons";
import { DiaryColors } from "@/constants/Colors";

interface CalenderPickerProps {
    date: Date;
    onChange: (selectedDate: Date) => void;
}

export default function CalenderPicker({ date, onChange }: CalenderPickerProps) {
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
                    <Text style={styles.timelineLabel}>TIMELINE</Text>
                    <Text style={styles.monthTitle}>
                        {date.toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}
                    </Text>
                </View>
            </View>

            <View style={styles.calendarContainer}>
                <Calendar
                    key={monthYearKey}
                    current={dateString}
                    onDayPress={onDayPress}
                    onMonthChange={onMonthChange}
                    renderArrow={(direction: 'left' | 'right') => (
                        <MaterialIcons 
                            name={direction === 'left' ? 'chevron-left' : 'chevron-right'} 
                            size={24} 
                            color={DiaryColors.primary} 
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
                                <Text style={styles.calendarMonthHeaderText}>
                                    {headerDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                </Text>
                                <MaterialIcons name="arrow-drop-down" size={20} color={DiaryColors.text} />
                            </TouchableOpacity>
                        );
                    }}
                    markedDates={{
                        [dateString]: { selected: true, selectedColor: DiaryColors.primary, selectedTextColor: DiaryColors.surfaceContainerLowest }
                    }}
                    theme={{
                        backgroundColor: 'transparent',
                        calendarBackground: 'transparent',
                        textSectionTitleColor: DiaryColors.onSurfaceVariant,
                        selectedDayBackgroundColor: DiaryColors.primary,
                        selectedDayTextColor: DiaryColors.surfaceContainerLowest,
                        todayTextColor: DiaryColors.primary,
                        dayTextColor: DiaryColors.text,
                        textDisabledColor: '#444',
                        arrowColor: DiaryColors.primary,
                        monthTextColor: DiaryColors.text,
                        textMonthFontWeight: 'bold',
                        textDayFontWeight: '500',
                    }}
                />
            </View>

            <Modal visible={pickerVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.yearSelector}>
                            <TouchableOpacity onPress={() => setTempYear(y => y - 1)} style={styles.yearArrow}>
                                <MaterialIcons name="chevron-left" size={32} color={DiaryColors.primary} />
                            </TouchableOpacity>
                            <Text style={styles.yearText}>{tempYear}</Text>
                            <TouchableOpacity onPress={() => setTempYear(y => y + 1)} style={styles.yearArrow}>
                                <MaterialIcons name="chevron-right" size={32} color={DiaryColors.primary} />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.monthsGrid}>
                            {months.map((m, i) => {
                                const isSelected = date.getMonth() === i && date.getFullYear() === tempYear;
                                return (
                                    <TouchableOpacity 
                                        key={m} 
                                        style={[styles.monthCell, isSelected && styles.monthCellSelected]}
                                        onPress={() => handleMonthSelect(i)}
                                    >
                                        <Text style={[styles.monthCellText, isSelected && styles.monthCellTextSelected]}>{m}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <TouchableOpacity style={styles.closeModalButton} onPress={() => setPickerVisible(false)}>
                            <Text style={styles.closeModalText}>Cancel</Text>
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
        color: DiaryColors.text,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    monthTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: DiaryColors.text,
        letterSpacing: -0.5,
    },
    calendarContainer: {
        backgroundColor: '#1f1f1f',
        borderRadius: 24,
        padding: 8,
        borderWidth: 1,
        borderColor: '#2c2c2c',
    },
    calendarMonthHeaderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    calendarMonthHeaderText: {
        color: DiaryColors.text,
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
        backgroundColor: '#1f1f1f',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: '#2c2c2c',
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
        color: DiaryColors.text,
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
    monthCellSelected: {
        backgroundColor: DiaryColors.primary,
    },
    monthCellText: {
        color: DiaryColors.text,
        fontSize: 16,
        fontWeight: '500',
    },
    monthCellTextSelected: {
        color: DiaryColors.surfaceContainerLowest,
        fontWeight: 'bold',
    },
    closeModalButton: {
        marginTop: 32,
        alignItems: 'center',
        paddingVertical: 12,
    },
    closeModalText: {
        color: DiaryColors.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
})