import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
    Appbar,
    Chip,
    Surface,
    Text,
    TextInput,
    useTheme
} from "react-native-paper";
import {
    DatePickerModal,
    TimePickerModal,
} from "react-native-paper-dates";
import { Frequency, Habit, Priority, formatDate, formatTime } from "../types/habits";
import { getPriorityColor } from "../constants/theme";
import MapPicker from './MapPicker';
import { useTranslation } from 'react-i18next';

type HabitFormProps = {
    habit?: Habit | null;
    onSave: (habit: Partial<Habit>) => void;
    onCancel: () => void;
};

export const HabitForm: React.FC<HabitFormProps> = ({
    habit = null,
    onSave,
    onCancel,
}) => {
    const theme = useTheme();
    const { t, i18n } = useTranslation();

    const [name, setName] = useState(habit?.name ?? "");
    const [category, setCategory] = useState(habit?.category ?? "");
    const [description, setDescription] = useState(habit?.description ?? "");
    const [time, setTime] = useState(habit?.time ?? "");
    const [selectedPriority, setSelectedPriority] = useState<Priority>(
        habit?.priority ?? Priority.MEDIUM
    );
    const [selectedFrequency, setSelectedFrequency] = useState<Frequency>(
        habit?.frequency ?? Frequency.DAILY
    );
    const [selectedDays, setSelectedDays] = useState<string[]>(
        habit?.daysOfWeek ?? []
    );
    const [startDate, setStartDate] = useState<Date>(
        habit?.startDate ? new Date(habit.startDate) : new Date()
    );
    const [endDate, setEndDate] = useState<Date>(
        habit?.endDate ? new Date(habit.endDate) : new Date()
    );
    const [dailyGoal, setDailyGoal] = useState(habit?.dailyGoal ?? "");
    const [additionalGoal, setAdditionalGoal] = useState(
        habit?.additionalGoal ?? ""
    );
    const [location, setLocation] = useState(habit?.location ?? "");

    const [startDateOpen, setStartDateOpen] = useState(false);
    const [endDateOpen, setEndDateOpen] = useState(false);
    const [timePickerOpen, setTimePickerOpen] = useState(false);

    const categories = [
        t('habitForm.categories.health'),
        t('habitForm.categories.productivity'),
        t('habitForm.categories.finances'),
        t('habitForm.categories.learning'),
        t('habitForm.categories.relationships'),
        t('habitForm.categories.hobbies'),
    ];

    const daysLabels = [
        t('weekdays.mon'),
        t('weekdays.tue'),
        t('weekdays.wed'),
        t('weekdays.thu'),
        t('weekdays.fri'),
        t('weekdays.sat'),
        t('weekdays.sun')
    ];

    const toggleWeekDay = (day: string) => {
        setSelectedDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    const handleSave = () => {
        if (!name.trim()) return;

        const habitToSave: Partial<Habit> = {
            name,
            category,
            description,
            time,
            reminders: time ? [time] : [],
            priority: selectedPriority,
            frequency: selectedFrequency,
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
            dailyGoal,
            additionalGoal,
            daysOfWeek: selectedDays,
            location,
        };

        onSave(habitToSave);
    };

    const isEditMode = !!habit;

    return (
        <View style={styles.container}>
            {/* Top App Bar */}
            <Appbar.Header elevated>
                <Appbar.BackAction onPress={onCancel} />
                <Appbar.Content
                    title={isEditMode ? t('habitForm.editTitle') : t('habitForm.newTitle')}
                />
                <Appbar.Action
                    icon="check"
                    disabled={!name.trim()}
                    onPress={handleSave}
                />
            </Appbar.Header>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Información básica */}
                <SectionTitle text={t('habitForm.basicInfo.title')} />

                <TextInput
                    mode="outlined"
                    label={t('habitForm.basicInfo.nameLabel')}
                    placeholder={t('habitForm.basicInfo.namePlaceholder')}
                    value={name}
                    onChangeText={setName}
                    style={styles.fullWidth}
                />

                {/* Categoría */}
                <View style={styles.section}>
                    <Text
                        style={{
                            fontSize: 14,
                            fontWeight: "500",
                            color: theme.colors.onSurfaceVariant,
                            marginBottom: 8,
                        }}
                    >
                        {t('habitForm.category.title')}
                    </Text>

                    <View style={styles.row}>
                        {categories.slice(0, 3).map((cat) => (
                            <CategoryChip
                                key={cat}
                                category={cat}
                                selected={category === cat}
                                onPress={() => setCategory(cat)}
                                style={styles.flex1}
                            />
                        ))}
                    </View>

                    <View style={styles.row}>
                        {categories.slice(3).map((cat) => (
                            <CategoryChip
                                key={cat}
                                category={cat}
                                selected={category === cat}
                                onPress={() => setCategory(cat)}
                                style={styles.flex1}
                            />
                        ))}
                    </View>
                </View>

                {/* Prioridad */}
                <SectionTitle text={t('habitForm.priority.title')} />
                <View style={styles.row}>
                    {Object.values(Priority).map((priority) => (
                        <PriorityChip
                            key={priority}
                            priority={priority}
                            selected={selectedPriority === priority}
                            onPress={() => setSelectedPriority(priority)}
                            style={styles.flex1}
                        />
                    ))}
                </View>

                {/* Frecuencia */}
                <SectionTitle text={t('habitForm.frequency.title')} />
                <View style={styles.row}>
                    {Object.values(Frequency).map((freq) => (
                        <FrequencyChip
                            key={freq}
                            frequency={freq}
                            selected={selectedFrequency === freq}
                            onPress={() => setSelectedFrequency(freq)}
                            style={styles.flex1}
                        />
                    ))}
                </View>

                {/* Días de la semana (solo Weekly) */}
                {selectedFrequency === Frequency.WEEKLY && (
                    <>
                        <View style={{ height: 16 }} />
                        <SectionTitle text={t('habitForm.weekdays.title')} />
                        <View style={styles.row}>
                            {daysLabels.map((day) => (
                                <DayOfWeekChip
                                    key={day}
                                    day={day}
                                    selected={selectedDays.includes(day)}
                                    onPress={() => toggleWeekDay(day)}
                                    style={styles.flex1}
                                />
                            ))}
                        </View>
                    </>
                )}

                {/* Período */}
                <SectionTitle text={t('habitForm.period.title')} />
                <View style={styles.row}>
                    <TextInput
                        mode="outlined"
                        label={t('habitForm.period.startDateLabel')}
                        placeholder={t('habitForm.period.selectPlaceholder')}
                        value={formatDate(startDate)}
                        style={styles.flex1}
                        right={
                            <TextInput.Icon
                                icon="calendar"
                                onPress={() => setStartDateOpen(true)}
                            />
                        }
                        editable={false}
                    />
                    <View style={{ width: 12 }} />
                    <TextInput
                        mode="outlined"
                        label={t('habitForm.period.endDateLabel')}
                        placeholder={t('habitForm.period.optionalPlaceholder')}
                        value={formatDate(endDate)}
                        style={styles.flex1}
                        right={
                            <TextInput.Icon
                                icon="calendar"
                                onPress={() => setEndDateOpen(true)}
                            />
                        }
                        editable={false}
                    />
                </View>

                {/* Date pickers */}
                <DatePickerModal
                    locale={i18n.language}
                    mode="single"
                    visible={startDateOpen}
                    onDismiss={() => setStartDateOpen(false)}
                    date={startDate}
                    onConfirm={({ date }: { date?: Date | undefined }) => {
                        if (date) setStartDate(date);
                        setStartDateOpen(false);
                    }}
                />
                <DatePickerModal
                    locale={i18n.language}
                    mode="single"
                    visible={endDateOpen}
                    onDismiss={() => setEndDateOpen(false)}
                    date={endDate}
                    onConfirm={({ date }: { date?: Date | undefined }) => {
                        if (date) setEndDate(date);
                        setEndDateOpen(false);
                    }}
                />

                {/* Recordatorio */}
                <SectionTitle text={t('habitForm.reminder.title')} />
                <TextInput
                    mode="outlined"
                    label={t('habitForm.reminder.timeLabel')}
                    placeholder={t('habitForm.reminder.timePlaceholder')}
                    value={time}
                    style={styles.fullWidth}
                    right={
                        <TextInput.Icon
                            icon="clock-outline"
                            onPress={() => setTimePickerOpen(true)}
                        />
                    }
                    editable={false}
                />

                <TimePickerModal
                    visible={timePickerOpen}
                    onDismiss={() => setTimePickerOpen(false)}
                    onConfirm={(params) => {
                        const { hours, minutes } = params;
                        const d = new Date();
                        d.setHours(hours);
                        d.setMinutes(minutes);
                        setTime(formatTime(d));
                        setTimePickerOpen(false);
                    }}
                    hours={new Date().getHours()}
                    minutes={new Date().getMinutes()}
                    locale={i18n.language}
                />

                {/* Objetivos */}
                <SectionTitle text={t('habitForm.goals.title')} />
                <TextInput
                    mode="outlined"
                    label={t('habitForm.goals.dailyGoalLabel')}
                    placeholder={t('habitForm.goals.dailyGoalPlaceholder')}
                    value={dailyGoal}
                    onChangeText={setDailyGoal}
                    style={styles.fullWidth}
                />
                <TextInput
                    mode="outlined"
                    label={t('habitForm.goals.additionalGoalLabel')}
                    placeholder={t('habitForm.goals.additionalGoalPlaceholder')}
                    value={additionalGoal}
                    onChangeText={setAdditionalGoal}
                    style={styles.fullWidth}
                />

                {/* Notas */}
                <SectionTitle text={t('habitForm.notes.title')} />
                <TextInput
                    mode="outlined"
                    label={t('habitForm.notes.descriptionLabel')}
                    placeholder={t('habitForm.notes.descriptionPlaceholder')}
                    value={description}
                    onChangeText={setDescription}
                    style={styles.fullWidth}
                    multiline
                    numberOfLines={4}
                />

                {/* Ubicación */}
                <SectionTitle text={t('habitForm.location.title')} />

                <MapPicker location={location} setLocation={setLocation} />

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

// ---------- Small components (chips + title) ----------

type SimpleChipProps = {
    selected: boolean;
    onPress: () => void;
    style?: any;
    children: React.ReactNode;
};

const SectionTitle: React.FC<{ text: string }> = ({ text }) => (
    <Text style={styles.sectionTitle}>{text}</Text>
);

const CategoryChip: React.FC<{
    category: string;
    selected: boolean;
    onPress: () => void;
    style?: any;
}> = ({ category, selected, onPress, style }) => {
    const theme = useTheme();
    return (
        <Surface
            style={[
                styles.chipSurface,
                style,
                {
                    backgroundColor: selected
                        ? theme.colors.primaryContainer
                        : theme.colors.surfaceVariant,
                },
            ]}
            elevation={0}
        >
            <Chip
                selected={selected}
                mode="flat"
                onPress={onPress}
                style={styles.fullChip}
                textStyle={{
                    fontSize: 12,
                    fontWeight: selected ? "500" : "400",
                }}
            >
                {category}
            </Chip>
        </Surface>
    );
};

const FrequencyChip: React.FC<{
    frequency: Frequency;
    selected: boolean;
    onPress: () => void;
    style?: any;
}> = ({ frequency, selected, onPress, style }) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const label =
        frequency === Frequency.DAILY
            ? t('habitForm.frequency.daily')
            : frequency === Frequency.WEEKLY
                ? t('habitForm.frequency.weekly')
                : t('habitForm.frequency.monthly');

    return (
        <Surface
            style={[
                styles.chipSurface,
                style,
                {
                    backgroundColor: selected
                        ? theme.colors.primaryContainer
                        : theme.colors.surfaceVariant,
                },
            ]}
            elevation={0}
        >
            <Chip
                selected={selected}
                mode="flat"
                onPress={onPress}
                style={styles.fullChip}
                textStyle={{
                    fontSize: 12,
                    fontWeight: selected ? "500" : "400",
                }}
            >
                {label}
            </Chip>
        </Surface>
    );
};

import { useThemeContext } from "../context/ThemeProvider";

const PriorityChip: React.FC<{
    priority: Priority;
    selected: boolean;
    onPress: () => void;
    style?: any;
}> = ({ priority, selected, onPress, style }) => {
    const { paperTheme } = useThemeContext();
    const { t } = useTranslation();
    const color = getPriorityColor(priority, paperTheme);
    const label = {
        [Priority.LOW]: t('habitForm.priority.low'),
        [Priority.MEDIUM]: t('habitForm.priority.medium'),
        [Priority.HIGH]: t('habitForm.priority.high'),
    }[priority];

    return (
        <Surface
            style={[
                styles.prioritySurface,
                style,
                {
                    backgroundColor: selected ? color : "transparent",
                    borderColor: color,
                },
            ]}
            elevation={0}
        >
            <Chip
                mode="outlined"
                selected={selected}
                onPress={onPress}
                style={[styles.fullChip, { borderColor: "transparent" }]}
                textStyle={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: selected ? "#FFFFFF" : color,
                }}
            >
                {label}
            </Chip>
        </Surface>
    );
};

const DayOfWeekChip: React.FC<{
    day: string;
    selected: boolean;
    onPress: () => void;
    style?: any;
}> = ({ day, selected, onPress, style }) => {
    const theme = useTheme();
    return (
        <Surface
            style={[
                styles.daySurface,
                style,
                {
                    backgroundColor: selected
                        ? theme.colors.primaryContainer
                        : theme.colors.surfaceVariant,
                },
            ]}
            elevation={0}
        >
            <Chip
                selected={selected}
                mode="flat"
                onPress={onPress}
                style={styles.fullChip}
                textStyle={{
                    fontSize: 12,
                    fontWeight: selected ? "500" : "400",
                }}
            >
                {day}
            </Chip>
        </Surface>
    );
};

// ---------- Styles ----------

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    fullWidth: {
        width: "100%",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
        marginTop: 16,
    },
    section: {
        marginBottom: 16,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        columnGap: 8,
        marginBottom: 8,
    },
    flex1: {
        flex: 1,
    },
    chipSurface: {
        borderRadius: 20,
        height: 40,
        justifyContent: "center",
    },
    daySurface: {
        borderRadius: 20,
        height: 40,
        justifyContent: "center",
    },
    fullChip: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
    },
    prioritySurface: {
        borderRadius: 12,
        height: 48,
        justifyContent: "center",
        borderWidth: 2,
    },
});
